// O motor da Câmera (useCamera) sozinho: o stream, a faixa de zoom que o aparelho declara, o
// recorte do zoom por CSS e da proporção, a lanterna, o vídeo e o desligar ao desmontar.
//
// Veio do RoqueOS (`tests/unit/composables/useCamera.spec.js`) sem mudança nos casos, com os
// mutantes que cada ⚠️ conta; o que é novo aqui é a métrica, que agora chega por `aoFotografar`.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useCamera } from '../src/useCamera.js'

// Mount the composable inside a throwaway component so onUnmounted() fires.
function withCamera(setupVideo, setupCanvas, opcoes = {}) {
  let api
  const Harness = defineComponent({
    setup() {
      const videoRef = ref(setupVideo || null)
      const canvasRef = ref(setupCanvas || null)
      api = useCamera({ videoRef, canvasRef, ...opcoes })
      return () => null
    },
  })
  const wrapper = mount(Harness)
  return { api, wrapper }
}

function makeVideoEl() {
  return { videoWidth: 640, videoHeight: 360, srcObject: null, play: vi.fn(async () => {}) }
}
function makeCanvasEl(ctx) {
  return {
    width: 0,
    height: 0,
    getContext: vi.fn(() => ctx),
    toDataURL: vi.fn(() => 'data:image/jpeg;base64,photo'),
  }
}

describe('useCamera', () => {
  let trackStop, applyConstraints, stream

  beforeEach(() => {
    trackStop = vi.fn()
    applyConstraints = vi.fn(async () => {})
    stream = {
      getTracks: () => [{ stop: trackStop }],
      getVideoTracks: () => [
        {
          stop: trackStop,
          applyConstraints,
          getCapabilities: () => ({ zoom: { min: 1, max: 5, step: 0.1 }, torch: true }),
          getSettings: () => ({ zoom: 1 }),
        },
      ],
    }
    navigator.mediaDevices = {
      enumerateDevices: vi.fn(async () => [
        { kind: 'videoinput', deviceId: 'a' },
        { kind: 'videoinput', deviceId: 'b' },
      ]),
      getUserMedia: vi.fn(async () => stream),
    }
    if (!global.URL.createObjectURL) global.URL.createObjectURL = vi.fn(() => 'blob:x')
    else vi.spyOn(global.URL, 'createObjectURL').mockReturnValue('blob:x')
    if (!global.URL.revokeObjectURL) global.URL.revokeObjectURL = vi.fn()
    else vi.spyOn(global.URL, 'revokeObjectURL').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('starts the stream, probes capabilities and detects multiple cameras', async () => {
    const { api } = withCamera(makeVideoEl())
    const result = await api.start()
    expect(result).toBe('streaming')
    expect(api.isStreaming.value).toBe(true)
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled()
    expect(api.hasMultipleCameras.value).toBe(true)
    expect(api.hasZoom.value).toBe(true)
    expect(api.hasTorch.value).toBe(true)
  })

  // ⚠️ `devices.filter(...).length > 1` virou `>= 1`: com UMA câmera só, o
  // botão de virar a câmera aparece e não faz nada -- o usuário aperta e o
  // aparelho reinicia o mesmo stream.
  it('uma câmera só não é "várias câmeras"', async () => {
    navigator.mediaDevices.enumerateDevices = vi.fn(async () => [
      { kind: 'videoinput', deviceId: 'a' },
      { kind: 'audioinput', deviceId: 'mic' },
      { kind: 'audiooutput', deviceId: 'alto-falante' },
    ])
    const { api } = withCamera(makeVideoEl())
    await api.start()
    expect(api.hasMultipleCameras.value).toBe(false)
  })

  it('nenhuma câmera listada também não é "várias câmeras"', async () => {
    navigator.mediaDevices.enumerateDevices = vi.fn(async () => [])
    const { api } = withCamera(makeVideoEl())
    await api.start()
    expect(api.hasMultipleCameras.value).toBe(false)
  })

  // ⚠️ `base.sx + (base.sw - sw) / 2` virou `-`: o recorte do zoom por CSS sai
  // do quadro (sx negativo) e a foto salva não é a que estava na tela. Só uma
  // asserção nos números exatos do `drawImage` pega isso.
  it('o zoom por CSS recorta o CENTRO do quadro', async () => {
    stream.getVideoTracks = () => [
      { stop: trackStop, applyConstraints, getCapabilities: () => ({}), getSettings: () => ({}) },
    ]
    const ctx = { translate: vi.fn(), scale: vi.fn(), drawImage: vi.fn() }
    const canvas = makeCanvasEl(ctx)
    const { api } = withCamera(makeVideoEl(), canvas) // 640 x 360
    await api.start()
    await api.setZoom(2) // sem zoom nativo: cai no CSS

    api.capturePhoto()
    // 640/2 = 320 de largura, 360/2 = 180 de altura, centrado: (160, 90).
    expect(ctx.drawImage).toHaveBeenCalledWith(expect.anything(), 160, 90, 320, 180, 0, 0, 320, 180)
    expect([canvas.width, canvas.height]).toEqual([320, 180])
  })

  it('sem zoom o recorte é o quadro inteiro', async () => {
    const ctx = { translate: vi.fn(), scale: vi.fn(), drawImage: vi.fn() }
    const canvas = makeCanvasEl(ctx)
    const { api } = withCamera(makeVideoEl(), canvas)
    await api.start()

    api.capturePhoto()
    expect(ctx.drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 640, 360, 0, 0, 640, 360)
  })

  // ⚠️ `z.min ?? 1` virou `z.min || 1`, e a diferença é exatamente o ZERO: um
  // aparelho que declara zoom a partir de 0 (ou passo contínuo, step 0) teria
  // os próprios números trocados por chutes nossos, e o controle na tela
  // deixaria de bater com o que a câmera aceita.
  it('a faixa de zoom é a que o aparelho declarou, zero inclusive', async () => {
    stream.getVideoTracks = () => [
      {
        stop: trackStop,
        applyConstraints,
        getCapabilities: () => ({ zoom: { min: 0, max: 8, step: 0 } }),
        getSettings: () => ({}),
      },
    ]
    const { api } = withCamera(makeVideoEl())
    await api.start()
    expect(api.zoomRange.value).toEqual({ min: 0, max: 8, step: 0 })
    expect(api.zoom.value).toBe(0) // sem setting atual, começa no mínimo declarado
  })

  it('sem capacidade de zoom, a faixa é a neutra', async () => {
    stream.getVideoTracks = () => [
      { stop: trackStop, applyConstraints, getCapabilities: () => ({}), getSettings: () => ({}) },
    ]
    const { api } = withCamera(makeVideoEl())
    await api.start()
    expect(api.zoomRange.value).toEqual({ min: 1, max: 1, step: 0.1 })
    expect(api.zoom.value).toBe(1)
  })

  it('maps a denied permission to status "denied"', async () => {
    navigator.mediaDevices.getUserMedia = vi.fn(async () => {
      throw { name: 'NotAllowedError' }
    })
    const { api } = withCamera(makeVideoEl())
    await api.start()
    expect(api.permissionDenied.value).toBe(true)
    expect(api.isStreaming.value).toBe(false)
  })

  it('switchCamera toggles facingMode and restarts', async () => {
    const { api } = withCamera(makeVideoEl())
    await api.start()
    expect(api.facingMode.value).toBe('environment')
    await api.switchCamera()
    expect(api.facingMode.value).toBe('user')
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(2)
  })

  it('setResolution restarts while streaming', async () => {
    const { api } = withCamera(makeVideoEl())
    await api.start()
    const calls = navigator.mediaDevices.getUserMedia.mock.calls.length
    await api.setResolution('fhd')
    expect(api.resolution.value).toBe('fhd')
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(calls + 1)
  })

  it('capturePhoto mirrors the front camera and stores the result', async () => {
    const ctx = { translate: vi.fn(), scale: vi.fn(), drawImage: vi.fn() }
    const { api } = withCamera(makeVideoEl(), makeCanvasEl(ctx))
    await api.start()
    api.facingMode.value = 'user'
    api.mirrorFront.value = true
    const url = api.capturePhoto()
    expect(ctx.translate).toHaveBeenCalled()
    expect(ctx.scale).toHaveBeenCalledWith(-1, 1)
    expect(url).toBe('data:image/jpeg;base64,photo')
    expect(api.captured.value).toEqual({ url, type: 'photo' })
  })

  it('setZoom uses applyConstraints when the device supports native zoom', async () => {
    const { api } = withCamera(makeVideoEl())
    await api.start()
    await api.setZoom(3)
    expect(applyConstraints).toHaveBeenCalledWith({ advanced: [{ zoom: 3 }] })
    expect(api.zoom.value).toBe(3)
    expect(api.cssZoom.value).toBe(1) // native → no CSS fallback
  })

  it('falls back to CSS zoom when the device has no native zoom', async () => {
    stream.getVideoTracks = () => [
      { stop: trackStop, applyConstraints, getCapabilities: () => ({}), getSettings: () => ({}) },
    ]
    const { api } = withCamera(makeVideoEl())
    await api.start()
    expect(api.hasZoom.value).toBe(false)
    await api.setZoom(2)
    expect(api.cssZoom.value).toBe(2)
  })

  it('toggleTorch applies the torch constraint', async () => {
    const { api } = withCamera(makeVideoEl())
    await api.start()
    await api.toggleTorch()
    expect(applyConstraints).toHaveBeenCalledWith({ advanced: [{ torch: true }] })
    expect(api.torchOn.value).toBe(true)
  })

  it('records video and produces a blob capture', async () => {
    const recorder = {
      state: 'inactive',
      start: vi.fn(function () {
        this.state = 'recording'
      }),
      stop: vi.fn(function () {
        this.state = 'inactive'
        this.onstop()
      }),
      ondataavailable: null,
      onstop: null,
    }
    global.MediaRecorder = vi.fn(() => recorder)
    const { api } = withCamera(makeVideoEl())
    await api.start()
    api.startVideoRecording()
    expect(api.isRecordingVideo.value).toBe(true)
    recorder.ondataavailable({ data: { size: 5 } })
    api.stopVideoRecording()
    expect(api.isRecordingVideo.value).toBe(false)
    expect(api.captured.value.type).toBe('video')
    expect(global.URL.createObjectURL).toHaveBeenCalled()
  })

  it('retake revokes a blob url and clears the capture', async () => {
    const { api } = withCamera(makeVideoEl())
    api.captured.value = { url: 'blob:vid', type: 'video' }
    api.retake()
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:vid')
    expect(api.captured.value).toBe(null)
  })

  // A métrica da foto era um import do analytics do RoqueOS; fora do núcleo, ela chega por
  // `aoFotografar`, uma vez por foto, e nunca quando não havia quadro para fotografar.
  it('avisa a métrica uma vez por foto tirada, e nenhuma sem quadro', async () => {
    const ctx = { translate: vi.fn(), scale: vi.fn(), drawImage: vi.fn() }
    const aoFotografar = vi.fn()
    const { api } = withCamera(makeVideoEl(), makeCanvasEl(ctx), { aoFotografar })
    await api.start()
    api.capturePhoto()
    api.capturePhoto()
    expect(aoFotografar).toHaveBeenCalledTimes(2)

    const semQuadro = withCamera({ ...makeVideoEl(), videoWidth: 0 }, makeCanvasEl(ctx), {
      aoFotografar,
    })
    await semQuadro.api.start()
    expect(semQuadro.api.capturePhoto()).toBe(null)
    expect(aoFotografar).toHaveBeenCalledTimes(2)
  })

  it('stops tracks on unmount', async () => {
    const { api, wrapper } = withCamera(makeVideoEl())
    await api.start()
    wrapper.unmount()
    expect(trackStop).toHaveBeenCalled()
  })
})
