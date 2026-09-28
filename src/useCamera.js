/**
 * O motor da Câmera: a vida do MediaStream, a captura de foto e de vídeo, o que o aparelho sabe
 * fazer (zoom, lanterna, várias câmeras) e o recorte da proporção.
 *
 * Veio do RoqueOS (`src/composables/useCamera.js`) sem mudança de lógica quando a Câmera saiu
 * do núcleo (Goal 28): o que mudou foi a métrica, que chega por `aoFotografar` em vez de o
 * motor importar o serviço de analytics do sistema. A tela (Camera.vue) fica só com a tela;
 * getUserMedia, canvas, MediaRecorder e applyConstraints moram aqui e têm teste sozinhos.
 *
 * Uso:
 *   const cam = useCamera({ videoRef, canvasRef, aoFotografar: () => sistema.metricas.evento(...) })
 *   onMounted(() => cam.start())
 *   cam.capturePhoto() -> cam.captured.value = { url, type: 'photo' }
 *
 * status: 'idle' | 'requesting' | 'streaming' | 'denied' | 'error'
 */

import { ref, computed, onUnmounted } from 'vue'

export const CAMERA_RESOLUTIONS = [
  { id: 'sd', label: '480p', width: 640, height: 480 },
  { id: 'hd', label: '720p', width: 1280, height: 720 },
  { id: 'fhd', label: '1080p', width: 1920, height: 1080 },
  { id: '4k', label: '4K', width: 3840, height: 2160 },
]

// Aspect ratios are applied as a canvas CROP at capture time (the constraint is
// only a hint — devices rarely honor an exact aspectRatio), so the saved file
// matches what the framing overlay shows. `null` = native (no crop).
export const CAMERA_ASPECTS = [
  { id: 'full', label: 'full', value: null },
  { id: 'square', label: '1:1', value: 1 },
  { id: '4_3', label: '4:3', value: 4 / 3 },
  { id: '16_9', label: '16:9', value: 16 / 9 },
]

export const CAMERA_GRID_TYPES = ['none', 'thirds', 'phi']

export function useCamera({ videoRef, canvasRef, aoFotografar = () => {} } = {}) {
  // --- lifecycle / status ---------------------------------------------------
  const status = ref('idle')
  const error = ref(null) // friendly i18n message string (set by the component)
  const isStreaming = computed(() => status.value === 'streaming')
  const permissionDenied = computed(() => status.value === 'denied')
  const isLoading = computed(() => status.value === 'requesting')

  // --- devices --------------------------------------------------------------
  const hasMultipleCameras = ref(false)

  // --- settings -------------------------------------------------------------
  const facingMode = ref('environment') // 'user' | 'environment'
  const resolution = ref('hd')
  const mirrorFront = ref(true)
  const aspect = ref('full')
  const mode = ref('photo') // 'photo' | 'video'

  // --- capabilities (probed from the active track) --------------------------
  const capabilities = ref(null)
  const hasZoom = computed(() => !!(capabilities.value && 'zoom' in capabilities.value))
  const hasTorch = computed(() => !!(capabilities.value && capabilities.value.torch))
  const zoomRange = computed(() => {
    const z = capabilities.value?.zoom
    return z
      ? { min: z.min ?? 1, max: z.max ?? 1, step: z.step ?? 0.1 }
      : { min: 1, max: 1, step: 0.1 }
  })
  const zoom = ref(1)
  const torchOn = ref(false)
  // CSS-zoom fallback factor when the device exposes no native `zoom` capability
  // (most desktops + iOS Safari). 1 = none. Driven by the same `zoom` ref.
  const cssZoom = computed(() => (hasZoom.value ? 1 : zoom.value))

  // --- capture result (owned here so the UI is pure) ------------------------
  const captured = ref(null) // { url, type: 'photo' | 'video' } | null
  const lastThumb = ref(null) // data URL of the last photo, for the gallery chip

  // --- video recording ------------------------------------------------------
  const isRecordingVideo = ref(false)
  const recordingDuration = ref(0)
  let mediaRecorder = null
  let recordedChunks = []
  let recordingInterval = null

  let stream = null

  const getTrack = () => stream?.getVideoTracks?.()[0] || null

  function probeCapabilities() {
    const track = getTrack()
    if (!track?.getCapabilities) {
      capabilities.value = null
      return
    }
    try {
      capabilities.value = track.getCapabilities()
      // Seed zoom to the current setting (or min) when supported.
      if (hasZoom.value) {
        const settings = track.getSettings?.() || {}
        zoom.value = settings.zoom ?? zoomRange.value.min
      } else {
        zoom.value = 1
      }
      torchOn.value = false
    } catch {
      capabilities.value = null
    }
  }

  async function checkCameras() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      hasMultipleCameras.value = devices.filter((d) => d.kind === 'videoinput').length > 1
    } catch (e) {
      console.error('[useCamera] enumerateDevices failed:', e)
    }
  }

  function stopStream() {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop())
      stream = null
    }
  }

  /**
   * (Re)start the stream with the current facingMode/resolution. Returns a
   * status string so the component can map it to a friendly i18n message.
   * 'streaming' | 'denied' | 'error'.
   */
  async function start() {
    if (status.value === 'requesting') return status.value
    status.value = 'requesting'
    error.value = null
    try {
      stopStream()
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('getUserMedia unsupported')

      const res = CAMERA_RESOLUTIONS.find((r) => r.id === resolution.value) || CAMERA_RESOLUTIONS[1]
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode.value,
          width: { ideal: res.width },
          height: { ideal: res.height },
        },
        audio: mode.value === 'video',
      })

      if (videoRef?.value) {
        videoRef.value.srcObject = stream
        await videoRef.value.play().catch(() => {})
      }
      probeCapabilities()
      status.value = 'streaming'
      // Device labels are only populated after the first grant.
      await checkCameras()
      return 'streaming'
    } catch (e) {
      console.error('[useCamera] start failed:', e)
      status.value =
        e?.name === 'NotAllowedError' || e?.name === 'PermissionDeniedError' ? 'denied' : 'error'
      return status.value
    }
  }

  async function switchCamera() {
    facingMode.value = facingMode.value === 'user' ? 'environment' : 'user'
    return start()
  }

  async function setResolution(id) {
    resolution.value = id
    if (isStreaming.value) return start()
  }

  async function setMode(next) {
    if (mode.value === next) return
    mode.value = next
    // Restarting toggles the audio track for video mode.
    if (isStreaming.value) return start()
  }

  async function setZoom(value) {
    zoom.value = value
    const track = getTrack()
    if (hasZoom.value && track?.applyConstraints) {
      try {
        await track.applyConstraints({ advanced: [{ zoom: value }] })
      } catch (e) {
        console.error('[useCamera] zoom applyConstraints failed:', e)
      }
    }
    // else: cssZoom computed drives a transform: scale() fallback in the UI.
  }

  async function toggleTorch() {
    const track = getTrack()
    if (!hasTorch.value || !track?.applyConstraints) return
    try {
      const next = !torchOn.value
      await track.applyConstraints({ advanced: [{ torch: next }] })
      torchOn.value = next
    } catch (e) {
      console.error('[useCamera] torch applyConstraints failed:', e)
    }
  }

  // --- capture --------------------------------------------------------------
  function aspectCropRect(vw, vh) {
    const target = CAMERA_ASPECTS.find((a) => a.id === aspect.value)?.value
    if (!target) return { sx: 0, sy: 0, sw: vw, sh: vh }
    const current = vw / vh
    if (current > target) {
      const sw = Math.round(vh * target)
      return { sx: Math.round((vw - sw) / 2), sy: 0, sw, sh: vh }
    }
    const sh = Math.round(vw / target)
    return { sx: 0, sy: Math.round((vh - sh) / 2), sw: vw, sh }
  }

  /**
   * Draw the current video frame to the canvas (honoring mirror + aspect crop +
   * CSS-zoom fallback) and return a JPEG data URL. quality 0..1.
   */
  function capturePhoto(quality = 0.95) {
    const video = videoRef?.value
    const canvas = canvasRef?.value
    if (!video || !canvas || !video.videoWidth) return null
    aoFotografar()

    const vw = video.videoWidth
    const vh = video.videoHeight
    // When using the CSS-zoom fallback, crop the source proportionally so the
    // saved photo matches the zoomed-in preview.
    const z = cssZoom.value > 1 ? cssZoom.value : 1
    const base = aspectCropRect(vw, vh)
    const sw = base.sw / z
    const sh = base.sh / z
    const sx = base.sx + (base.sw - sw) / 2
    const sy = base.sy + (base.sh - sh) / 2

    canvas.width = Math.round(sw)
    canvas.height = Math.round(sh)
    const ctx = canvas.getContext('2d')

    if (facingMode.value === 'user' && mirrorFront.value) {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)

    const url = canvas.toDataURL('image/jpeg', quality)
    captured.value = { url, type: 'photo' }
    lastThumb.value = url
    return url
  }

  function startVideoRecording() {
    if (!stream) return
    recordedChunks = []
    try {
      mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus' })
    } catch {
      try {
        mediaRecorder = new MediaRecorder(stream)
      } catch (e) {
        console.error('[useCamera] MediaRecorder unsupported:', e)
        return
      }
    }
    mediaRecorder.ondataavailable = (e) => {
      if (e.data?.size > 0) recordedChunks.push(e.data)
    }
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' })
      captured.value = { url: URL.createObjectURL(blob), type: 'video' }
      lastThumb.value = null
    }
    mediaRecorder.start()
    isRecordingVideo.value = true
    recordingDuration.value = 0
    recordingInterval = setInterval(() => (recordingDuration.value += 1), 1000)
  }

  function stopVideoRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop()
    isRecordingVideo.value = false
    if (recordingInterval) {
      clearInterval(recordingInterval)
      recordingInterval = null
    }
  }

  function retake() {
    if (captured.value?.url?.startsWith('blob:')) URL.revokeObjectURL(captured.value.url)
    captured.value = null
  }

  function cleanup() {
    stopVideoRecording()
    stopStream()
    if (captured.value?.url?.startsWith('blob:')) URL.revokeObjectURL(captured.value.url)
  }

  onUnmounted(cleanup)

  return {
    // status
    status,
    error,
    isLoading,
    isStreaming,
    permissionDenied,
    // devices
    hasMultipleCameras,
    // settings
    facingMode,
    resolution,
    mirrorFront,
    aspect,
    mode,
    // capabilities / pro controls
    capabilities,
    hasZoom,
    hasTorch,
    zoom,
    zoomRange,
    cssZoom,
    torchOn,
    // capture state
    captured,
    lastThumb,
    isRecordingVideo,
    recordingDuration,
    // methods
    start,
    stopStream,
    switchCamera,
    setResolution,
    setMode,
    setZoom,
    toggleTorch,
    capturePhoto,
    startVideoRecording,
    stopVideoRecording,
    retake,
    cleanup,
  }
}
