<template>
  <div class="camera" :class="{ 'camera--leve': estado.leve }" :style="acentoCss">
    <!-- A malha de cor atrás da moldura (sem ela no perfil leve). -->
    <div class="camera__malha" aria-hidden="true"></div>

    <!-- A barra de cima: a câmera é imersiva, o "menu" é só a folha de ajustes. -->
    <div class="camera__barra">
      <div class="camera__marca">
        <RosIcone nome="photo_camera" :tamanho="18" />
        <span>{{ t('title') }}</span>
      </div>
      <div class="camera__espaco"></div>
      <RosBotao
        v-if="cam.hasTorch.value"
        :icone="cam.torchOn.value ? 'flash_on' : 'flash_off'"
        :rotulo="t('torch')"
        :ligado="cam.torchOn.value"
        :acento="ACENTO"
        @click="cam.toggleTorch()"
      />
      <RosBotao
        v-if="cam.hasMultipleCameras.value"
        icone="cameraswitch"
        :rotulo="t('switchCamera')"
        :acento="ACENTO"
        @click="cam.switchCamera()"
      />
      <RosBotao
        icone="tune"
        :rotulo="t('comumSettings')"
        :acento="ACENTO"
        @click="ajustesAbertos = true"
      />
    </div>

    <div class="camera__principal">
      <div
        class="camera__visor"
        @pointerdown="aoApertarNoVisor"
        @pointermove="aoMoverNoVisor"
        @pointerup="aoSoltarNoVisor"
        @pointercancel="aoSoltarNoVisor"
      >
        <!-- A imagem ao vivo (o zoom por CSS quando o aparelho não tem zoom nativo). -->
        <video
          v-show="!capturado && cam.isStreaming.value"
          ref="videoRef"
          autoplay
          playsinline
          muted
          class="camera__video"
          :style="{ transform: transformacaoDoVideo }"
        ></video>

        <!-- O que foi capturado -->
        <img
          v-if="capturado && capturado.type === 'photo'"
          :src="capturado.url"
          class="camera__previa"
          :alt="t('photo')"
        />
        <video
          v-else-if="capturado && capturado.type === 'video'"
          class="camera__previa"
          :src="capturado.url"
          controls
          autoplay
          playsinline
          loop
        ></video>

        <!-- Iniciando, sem permissão, ou câmera indisponível -->
        <div
          v-if="mostraEstado"
          class="camera__estado"
          :role="cam.isLoading.value ? 'status' : 'alert'"
        >
          <RosVazio
            :icone="iconeDoEstado"
            :titulo="tituloDoEstado"
            :subtitulo="subtituloDoEstado"
            :acento="ACENTO"
            :carregando="cam.isLoading.value"
            :leve="estado.leve"
          />
          <p v-if="cam.permissionDenied.value" class="camera__ajuda">{{ t('permissionHelp') }}</p>
          <RosBotao
            v-if="!cam.isLoading.value"
            variante="primario"
            :acento="ACENTO"
            @click="cam.start()"
          >
            {{ t('comumRetry') }}
          </RosBotao>
        </div>

        <!-- O que ajuda a enquadrar (só sobre a imagem ao vivo) -->
        <template v-if="cam.isStreaming.value && !capturado">
          <div
            v-if="proporcao"
            class="camera__mascara"
            :style="{ '--camera-proporcao': String(proporcao) }"
            aria-hidden="true"
          ></div>

          <svg
            v-if="grade !== 'none'"
            class="camera__grade"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <template v-if="grade === 'thirds'">
              <line x1="33.33" y1="0" x2="33.33" y2="100" />
              <line x1="66.66" y1="0" x2="66.66" y2="100" />
              <line x1="0" y1="33.33" x2="100" y2="33.33" />
              <line x1="0" y1="66.66" x2="100" y2="66.66" />
            </template>
            <template v-else-if="grade === 'phi'">
              <line x1="38.2" y1="0" x2="38.2" y2="100" />
              <line x1="61.8" y1="0" x2="61.8" y2="100" />
              <line x1="0" y1="38.2" x2="100" y2="38.2" />
              <line x1="0" y1="61.8" x2="100" y2="61.8" />
            </template>
          </svg>

          <div v-if="mostraNivel" class="camera__nivel" aria-hidden="true">
            <div
              class="camera__nivel-barra"
              :class="{ 'camera__nivel-barra--reto': reto }"
              :style="{ transform: `rotate(${inclinacao}deg)` }"
            ></div>
          </div>

          <div
            v-if="foco.visivel"
            class="camera__foco"
            :style="{ left: foco.x + 'px', top: foco.y + 'px' }"
            aria-hidden="true"
          ></div>

          <div v-if="cam.zoom.value > 1.01" class="camera__selo-zoom">
            {{ cam.zoom.value.toFixed(1) }}×
          </div>
        </template>

        <div v-if="contagem > 0" class="camera__contagem" aria-live="assertive">{{ contagem }}</div>
        <div v-if="flash" class="camera__flash" aria-hidden="true"></div>

        <div v-if="cam.isRecordingVideo.value" class="camera__gravando">
          <span class="camera__gravando-ponto"></span>
          <span>{{ duracao(cam.recordingDuration.value) }}</span>
        </div>
      </div>

      <!-- O zoom, quando faz sentido -->
      <div v-if="cam.isStreaming.value && !capturado && zoomMaximo > 1.01" class="camera__zoom">
        <RosIcone nome="zoom_out" :tamanho="18" />
        <input
          class="camera__faixa"
          type="range"
          :min="zoomMinimo"
          :max="zoomMaximo"
          step="0.1"
          :value="cam.zoom.value"
          :aria-label="t('zoom')"
          @input="cam.setZoom(Number($event.target.value))"
        />
        <RosIcone nome="zoom_in" :tamanho="18" />
      </div>

      <div class="camera__controles">
        <!-- As Imagens, no Finder -->
        <button
          v-if="!capturado"
          type="button"
          class="camera__galeria"
          :title="nomeDaPasta"
          :aria-label="nomeDaPasta"
          @click="abrirImagens"
        >
          <img v-if="cam.lastThumb.value" :src="cam.lastThumb.value" alt="" />
          <RosIcone v-else nome="photo_library" :tamanho="22" />
        </button>

        <!-- O disparador: foto, ou começar e parar o vídeo -->
        <button
          v-if="!capturado"
          type="button"
          class="camera__disparador"
          :class="{
            'camera__disparador--gravando': cam.isRecordingVideo.value,
            'camera__disparador--video': cam.mode.value === 'video',
          }"
          :disabled="!cam.isStreaming.value"
          :aria-label="cam.mode.value === 'photo' ? t('photo') : t('video')"
          @click="disparar"
        >
          <span class="camera__disparador-miolo"></span>
        </button>

        <!-- Depois de capturar -->
        <div v-else class="camera__acoes">
          <button
            type="button"
            class="camera__acao camera__acao--descartar"
            :title="t('comumCancel')"
            :aria-label="t('comumCancel')"
            @click="cam.retake()"
          >
            <RosIcone nome="close" :tamanho="26" />
          </button>
          <button
            type="button"
            class="camera__acao"
            :title="t('comumDownload')"
            :aria-label="t('comumDownload')"
            @click="baixar"
          >
            <RosIcone nome="download" :tamanho="22" />
          </button>
          <button
            type="button"
            class="camera__acao camera__acao--salvar"
            :title="t('comumSave')"
            :aria-label="t('comumSave')"
            :disabled="salvando"
            @click="salvar"
          >
            <RosIcone nome="save" :tamanho="22" />
          </button>
          <button
            type="button"
            class="camera__acao"
            :title="t('comumShare')"
            :aria-label="t('comumShare')"
            @click="compartilhar"
          >
            <RosIcone nome="share" :tamanho="22" />
          </button>
        </div>

        <!-- Foto ou vídeo -->
        <div v-if="!capturado" class="camera__modo">
          <button
            type="button"
            :class="{ 'camera__modo--ativo': cam.mode.value === 'photo' }"
            :aria-pressed="cam.mode.value === 'photo'"
            :title="t('photo')"
            @click="cam.setMode('photo')"
          >
            <RosIcone nome="photo_camera" :tamanho="20" />
            <span>{{ t('photo') }}</span>
          </button>
          <button
            type="button"
            :class="{ 'camera__modo--ativo': cam.mode.value === 'video' }"
            :aria-pressed="cam.mode.value === 'video'"
            :title="t('video')"
            @click="cam.setMode('video')"
          >
            <RosIcone nome="videocam" :tamanho="20" />
            <span>{{ t('video') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Os ajustes -->
    <RosFolha
      v-model="ajustesAbertos"
      :titulo="t('comumSettings')"
      icone="tune"
      :acento="ACENTO"
      :rotulo-fechar="t('comumClose')"
    >
      <div class="camera__ajustes">
        <div class="camera__ajuste">
          <span class="camera__ajuste-rotulo"
            ><RosIcone nome="timer" :tamanho="18" />{{ t('timer') }}</span
          >
          <div class="camera__opcoes">
            <button
              v-for="s in TEMPOS"
              :key="s"
              type="button"
              :class="{ 'camera__opcao--ativa': temporizador === s }"
              :aria-pressed="temporizador === s"
              @click="temporizador = s"
            >
              {{ s === 0 ? t('comumNone') : `${s}s` }}
            </button>
          </div>
        </div>

        <div class="camera__ajuste">
          <span class="camera__ajuste-rotulo"
            ><RosIcone nome="aspect_ratio" :tamanho="18" />{{ t('aspectRatio') }}</span
          >
          <div class="camera__opcoes">
            <button
              v-for="a in CAMERA_ASPECTS"
              :key="a.id"
              type="button"
              :class="{ 'camera__opcao--ativa': cam.aspect.value === a.id }"
              :aria-pressed="cam.aspect.value === a.id"
              @click="cam.aspect.value = a.id"
            >
              {{ a.id === 'full' ? t('ratioFull') : a.label }}
            </button>
          </div>
        </div>

        <div class="camera__ajuste">
          <span class="camera__ajuste-rotulo"
            ><RosIcone nome="hd" :tamanho="18" />{{ t('resolution') }}</span
          >
          <div class="camera__opcoes">
            <button
              v-for="r in CAMERA_RESOLUTIONS"
              :key="r.id"
              type="button"
              :class="{ 'camera__opcao--ativa': cam.resolution.value === r.id }"
              :aria-pressed="cam.resolution.value === r.id"
              @click="cam.setResolution(r.id)"
            >
              {{ r.label }}
            </button>
          </div>
        </div>

        <div class="camera__ajuste">
          <span class="camera__ajuste-rotulo"
            ><RosIcone nome="grid_on" :tamanho="18" />{{ t('gridType') }}</span
          >
          <div class="camera__opcoes">
            <button
              v-for="g in CAMERA_GRID_TYPES"
              :key="g"
              type="button"
              :class="{ 'camera__opcao--ativa': grade === g }"
              :aria-pressed="grade === g"
              @click="grade = g"
            >
              {{ t(ROTULO_DA_GRADE[g]) }}
            </button>
          </div>
        </div>

        <label class="camera__ajuste camera__ajuste--linha">
          <span class="camera__ajuste-rotulo"
            ><RosIcone nome="flip" :tamanho="18" />{{ t('mirrorFrontCamera') }}</span
          >
          <RosInterruptor
            v-model="cam.mirrorFront.value"
            :rotulo="t('mirrorFrontCamera')"
            :acento="ACENTO"
          />
        </label>

        <label class="camera__ajuste camera__ajuste--linha">
          <span class="camera__ajuste-rotulo"
            ><RosIcone nome="straighten" :tamanho="18" />{{ t('level') }}</span
          >
          <RosInterruptor
            :model-value="nivelLigado"
            :rotulo="t('level')"
            :acento="ACENTO"
            @update:model-value="alternarNivel"
          />
        </label>
      </div>
    </RosFolha>

    <canvas ref="canvasRef" class="camera__tela-oculta"></canvas>
  </div>
</template>

<script setup>
// A tela da Câmera. O motor (useCamera.js) cuida do MediaStream; aqui ficam o visor, o que
// ajuda a enquadrar, o disparador e o que fazer com a captura. O que é do RoqueOS vem pelo
// `sistema`: salvar nas Imagens, abrir as Imagens no Finder, avisar e a métrica.
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RosBotao, RosFolha, RosIcone, RosInterruptor, RosVazio } from '@roqueos-apps/ui'
import { useCamera, CAMERA_RESOLUTIONS, CAMERA_ASPECTS, CAMERA_GRID_TYPES } from './useCamera.js'
import { traduzir } from './textos.js'
import './camera.scss'

const props = defineProps({
  sistema: { type: Object, required: true },
  estado: { type: Object, required: true },
})

const ACENTO = '#10b981'
const TEMPOS = [0, 3, 5, 10]
const ROTULO_DA_GRADE = { none: 'gridNone', thirds: 'gridThirds', phi: 'gridPhi' }
const t = (chave) => traduzir(props.estado.textos, chave)
const acentoCss = { '--camera-acento': ACENTO, '--camera-acento-rgb': '16, 185, 129' }

const videoRef = ref(null)
const canvasRef = ref(null)
const cam = useCamera({
  videoRef,
  canvasRef,
  // O nome do evento é o de antes da saída do núcleo: o histórico depende dele.
  aoFotografar: () => props.sistema.metricas.evento('photo_capture'),
})
const capturado = computed(() => cam.captured.value)

const ajustesAbertos = ref(false)
const temporizador = ref(0)
const contagem = ref(0)
const grade = ref('thirds')
const flash = ref(false)
const salvando = ref(false)

// O botão da galeria abre as Imagens no Finder, e diz isso com o nome que o Finder mostra.
const nomeDaPasta = computed(() => t('imagens'))

// --- zoom (nativo, ou por CSS) -----------------------------------------------------------
const zoomMinimo = computed(() => (cam.hasZoom.value ? cam.zoomRange.value.min : 1))
const zoomMaximo = computed(() => (cam.hasZoom.value ? cam.zoomRange.value.max : 4))
const transformacaoDoVideo = computed(() => {
  const espelho = cam.facingMode.value === 'user' && cam.mirrorFront.value ? -1 : 1
  const z = cam.cssZoom.value > 1 ? cam.cssZoom.value : 1
  return `scaleX(${espelho}) scale(${z})`
})

// --- a máscara da proporção ---------------------------------------------------------------
const proporcao = computed(
  () => CAMERA_ASPECTS.find((a) => a.id === cam.aspect.value)?.value || null,
)

// --- o nível (DeviceOrientation) ----------------------------------------------------------
const nivelLigado = ref(false)
const inclinacao = ref(0)
const mostraNivel = computed(() => nivelLigado.value && cam.isStreaming.value && !capturado.value)
const reto = computed(() => Math.abs(inclinacao.value) < 1.5)
function aoOrientar(e) {
  // gamma é a inclinação para os lados; presa numa faixa que dá para ler.
  if (typeof e.gamma === 'number') inclinacao.value = Math.max(-45, Math.min(45, e.gamma))
}
async function alternarNivel(ligar) {
  if (!ligar) {
    nivelLigado.value = false
    window.removeEventListener('deviceorientation', aoOrientar)
    return
  }
  // O iOS pede a permissão com um gesto da pessoa.
  try {
    const DOE = window.DeviceOrientationEvent
    if (DOE && typeof DOE.requestPermission === 'function') {
      const resposta = await DOE.requestPermission()
      if (resposta !== 'granted') {
        nivelLigado.value = false
        return
      }
    }
    window.addEventListener('deviceorientation', aoOrientar)
    nivelLigado.value = true
  } catch {
    nivelLigado.value = false
  }
}

// --- o anel de foco (toque no visor; só o gesto, onde o aparelho não foca) -----------------
const foco = ref({ visivel: false, x: 0, y: 0 })
let temporizadorDoFoco = null
let temporizadorDoFlash = null
let temporizadorDaContagem = null

// --- pinça para o zoom no visor -----------------------------------------------------------
const ponteiros = new Map()
let distanciaInicial = 0
let zoomInicial = 1
function aoApertarNoVisor(e) {
  ponteiros.set(e.pointerId, { x: e.clientX, y: e.clientY })
  if (ponteiros.size === 2) {
    const [a, b] = [...ponteiros.values()]
    distanciaInicial = Math.hypot(a.x - b.x, a.y - b.y)
    zoomInicial = cam.zoom.value
  }
}
function aoMoverNoVisor(e) {
  if (!ponteiros.has(e.pointerId)) return
  ponteiros.set(e.pointerId, { x: e.clientX, y: e.clientY })
  if (ponteiros.size === 2 && distanciaInicial > 0) {
    const [a, b] = [...ponteiros.values()]
    const fator = Math.hypot(a.x - b.x, a.y - b.y) / distanciaInicial
    const proximo = Math.max(zoomMinimo.value, Math.min(zoomMaximo.value, zoomInicial * fator))
    cam.setZoom(Number(proximo.toFixed(2)))
  }
}
function aoSoltarNoVisor(e) {
  const eraPinca = ponteiros.size === 2
  ponteiros.delete(e.pointerId)
  if (ponteiros.size < 2) distanciaInicial = 0
  // Um toque só (não a pinça) na imagem ao vivo mostra o anel de foco.
  if (!eraPinca && ponteiros.size === 0 && cam.isStreaming.value && !capturado.value) {
    const caixa = e.currentTarget.getBoundingClientRect()
    foco.value = { visivel: true, x: e.clientX - caixa.left, y: e.clientY - caixa.top }
    clearTimeout(temporizadorDoFoco)
    temporizadorDoFoco = setTimeout(() => (foco.value.visivel = false), 900)
  }
}

// --- o estado do visor ----------------------------------------------------------------------
const mostraEstado = computed(
  () => cam.isLoading.value || cam.permissionDenied.value || cam.status.value === 'error',
)
const iconeDoEstado = computed(() => {
  if (cam.isLoading.value) return 'photo_camera'
  return cam.permissionDenied.value ? 'no_photography' : 'videocam_off'
})
const tituloDoEstado = computed(() => {
  if (cam.isLoading.value) return t('loadingTitle')
  if (cam.permissionDenied.value) return t('permissionDenied')
  return t('errorTitle')
})
const subtituloDoEstado = computed(() => {
  if (cam.isLoading.value) return t('startingCamera')
  return cam.permissionDenied.value ? '' : t('errorStarting')
})

// --- capturar -------------------------------------------------------------------------------
function disparar() {
  if (cam.mode.value === 'video') {
    cam.isRecordingVideo.value ? cam.stopVideoRecording() : cam.startVideoRecording()
    return
  }
  if (temporizador.value > 0 && contagem.value === 0) {
    contagem.value = temporizador.value
    clearInterval(temporizadorDaContagem)
    temporizadorDaContagem = setInterval(() => {
      contagem.value -= 1
      if (contagem.value === 0) {
        clearInterval(temporizadorDaContagem)
        fotografar()
      }
    }, 1000)
    return
  }
  fotografar()
}
function fotografar() {
  cam.capturePhoto(0.95)
  flash.value = true
  clearTimeout(temporizadorDoFlash)
  temporizadorDoFlash = setTimeout(() => (flash.value = false), 150)
}

function duracao(s) {
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
}

async function blobDaCaptura() {
  const resposta = await fetch(capturado.value.url)
  return resposta.blob()
}
// O nome de antes da saída do núcleo: quem já tem fotos da Câmera nas Imagens continua vendo
// todas com o mesmo começo.
function nomeDoArquivo() {
  const ehVideo = capturado.value.type === 'video'
  return `RoqueOS_${ehVideo ? 'Video' : 'Photo'}_${Date.now()}.${ehVideo ? 'webm' : 'jpg'}`
}

function baixar() {
  if (!capturado.value) return
  const a = document.createElement('a')
  a.href = capturado.value.url
  a.download = nomeDoArquivo()
  a.click()
  props.sistema.avisar(t('downloadSuccess'), { tipo: 'sucesso', titulo: t('comumSuccess') })
}

async function salvar() {
  if (!capturado.value || salvando.value) return
  salvando.value = true
  try {
    const blob = await blobDaCaptura()
    await props.sistema.arquivos.salvar({
      nome: nomeDoArquivo(),
      conteudo: blob,
      tipo: blob.type || (capturado.value.type === 'video' ? 'video/webm' : 'image/jpeg'),
      pasta: 'Imagens',
    })
    props.sistema.avisar(t('saveSuccess'), { tipo: 'sucesso', titulo: t('comumSuccess') })
    cam.retake()
  } catch (erro) {
    // Sem conta o sistema recusa: a captura continua na tela, e baixar ainda funciona.
    if (erro?.codigo === 'sem-conta') {
      props.sistema.avisar(t('semConta'), { tipo: 'aviso' })
    } else {
      console.error('[camera] salvar', erro?.codigo ?? erro)
      props.sistema.avisar(t('saveError'), { tipo: 'erro', titulo: t('comumError') })
    }
  } finally {
    salvando.value = false
  }
}

async function compartilhar() {
  if (!capturado.value || !navigator.share) {
    baixar()
    return
  }
  try {
    const blob = await blobDaCaptura()
    const arquivo = new File([blob], nomeDoArquivo(), { type: blob.type })
    await navigator.share({ files: [arquivo], title: t('title') })
  } catch (erro) {
    if (erro?.name !== 'AbortError') baixar()
  }
}

async function abrirImagens() {
  try {
    await props.sistema.arquivos.abrirPasta('Imagens')
  } catch (erro) {
    if (erro?.codigo === 'sem-conta') props.sistema.avisar(t('semConta'), { tipo: 'aviso' })
    else console.error('[camera] abrir as Imagens', erro?.codigo ?? erro)
  }
}

onMounted(() => cam.start())
onUnmounted(() => {
  window.removeEventListener('deviceorientation', aoOrientar)
  clearTimeout(temporizadorDoFoco)
  clearTimeout(temporizadorDoFlash)
  clearInterval(temporizadorDaContagem)
})
</script>
