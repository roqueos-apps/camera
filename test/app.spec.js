// A Câmera como o app-sdk entende um app: o `mount` que o RoqueOS chama, com o sistema falso do
// SDK e o motor de verdade (useCamera), sobre uma câmera de mentira do navegador. O motor tem o
// spec dele (useCamera.spec.js); aqui é a tela e o que ela pede ao sistema: o texto no idioma, a
// troca ao vivo, os estados do visor, salvar nas Imagens (e o que acontece sem conta), abrir as
// Imagens no Finder, o temporizador, o vídeo, a métrica, o perfil leve e o desmontar que desliga
// a câmera.
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { criarSistemaFalso } from '@roqueos-apps/app-sdk/sistema-falso'
import { validarManifesto, verificarSistema } from '@roqueos-apps/app-sdk'
import camera, { CAPACIDADES } from '../src/index.js'
import manifesto from '../app.json'

const ANA = { uid: 'ana', nome: 'Ana' }
const CONVIDADO = { uid: null, nome: null }

// --- a câmera de mentira do navegador --------------------------------------------------------
let trilha
let pedidos
function prepararCamera({ falha, recursos = { torch: true } } = {}) {
  trilha = {
    stop: vi.fn(),
    applyConstraints: vi.fn(async () => {}),
    getCapabilities: () => recursos,
    getSettings: () => ({}),
  }
  pedidos = []
  const stream = { getTracks: () => [trilha], getVideoTracks: () => [trilha] }
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: {
      enumerateDevices: vi.fn(async () => [
        { kind: 'videoinput', deviceId: 'traseira' },
        { kind: 'videoinput', deviceId: 'frontal' },
      ]),
      getUserMedia: vi.fn(async (pedido) => {
        pedidos.push(pedido)
        if (falha) throw falha
        return stream
      }),
    },
  })
}

beforeEach(() => {
  prepararCamera()
  // O jsdom não tem vídeo nem canvas de verdade: o quadro tem 640x360, e o canvas devolve um
  // JPEG de mentira.
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
  vi.spyOn(HTMLVideoElement.prototype, 'videoWidth', 'get').mockReturnValue(640)
  vi.spyOn(HTMLVideoElement.prototype, 'videoHeight', 'get').mockReturnValue(360)
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    translate() {},
    scale() {},
    drawImage() {},
  })
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(
    'data:image/jpeg;base64,Zm90bw==',
  )
  // A foto e o vídeo viram Blob pelo fetch da URL; o Blob do jsdom, que é o que o SDK aceita.
  globalThis.fetch = vi.fn(async (url) => ({
    blob: async () =>
      new Blob(['x'], { type: String(url).startsWith('blob:') ? 'video/webm' : 'image/jpeg' }),
  }))
  if (!URL.createObjectURL) URL.createObjectURL = () => ''
  if (!URL.revokeObjectURL) URL.revokeObjectURL = () => {}
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:video-1')
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
  document.body.innerHTML = ''
  delete globalThis.MediaRecorder
})

function montar({ identidade = ANA, idioma = 'pt-BR', modoLeve = false } = {}) {
  const falso = criarSistemaFalso({
    appId: 'camera',
    identidade,
    idioma,
    modoLeve,
    pastas: manifesto.pastas,
  })
  const el = document.createElement('div')
  document.body.appendChild(el)
  const montagem = camera.mount(el, falso.sistema, { windowId: 'w1', ativo: true })
  const botao = (rotulo) =>
    [...el.querySelectorAll('button')].find(
      (b) =>
        b.getAttribute('aria-label') === rotulo ||
        b.getAttribute('title') === rotulo ||
        b.textContent.trim() === rotulo,
    )
  const texto = () => el.textContent.replace(/\s+/g, ' ')
  return { ...falso, el, montagem, botao, texto }
}

const aoVivo = (el) =>
  vi.waitFor(() => {
    expect(el.querySelector('.camera')).not.toBeNull()
    expect(el.querySelector('.camera__disparador').disabled).toBe(false)
  })

describe('a Câmera pelo app-sdk', () => {
  it('o id e as capacidades são os do manifesto, e o manifesto é válido', () => {
    expect(validarManifesto(manifesto)).toEqual([])
    expect([camera.id, [...camera.capacidades]]).toEqual([manifesto.id, manifesto.capacidades])
    expect([...CAPACIDADES]).toEqual(manifesto.capacidades)
    const { sistema } = criarSistemaFalso({ pastas: manifesto.pastas })
    expect(verificarSistema(sistema, { exigidas: [...CAPACIDADES] }).ok).toBe(true)
  })

  it('abre a câmera traseira, com a barra no idioma e os botões que o aparelho sustenta', async () => {
    const f = montar()
    await aoVivo(f.el)
    expect(pedidos[0]).toMatchObject({ video: { facingMode: 'environment' }, audio: false })
    expect(f.el.querySelector('.camera__marca').textContent.trim()).toBe('Câmera')
    expect(f.botao('Configurações')).toBeTruthy()
    // Duas câmeras: trocar aparece. A lanterna só porque a trilha diz `torch`.
    expect(f.botao('Trocar Câmera')).toBeTruthy()
    expect(f.botao('Lanterna').getAttribute('aria-pressed')).toBe('false')
    f.montagem.desmontar()
  })

  it('sem lanterna no aparelho, não há botão de lanterna', async () => {
    prepararCamera({ recursos: {} })
    const f = montar()
    await aoVivo(f.el)
    expect(f.botao('Lanterna')).toBeUndefined()
    f.montagem.desmontar()
  })

  it('a troca de idioma com a janela aberta troca o texto', async () => {
    const f = montar()
    await aoVivo(f.el)
    f.mudarIdioma('en-US')
    await vi.waitFor(() => expect(f.botao('Settings')).toBeTruthy())
    expect(f.botao('Configurações')).toBeUndefined()
    f.montagem.desmontar()
  })

  it('permissão negada: o visor diz o que houve e como liberar, e tentar de novo pede outra vez', async () => {
    prepararCamera({ falha: { name: 'NotAllowedError' } })
    const f = montar()
    await vi.waitFor(() => expect(f.texto()).toContain('Acesso à câmera negado'))
    expect(f.texto()).toContain('Permita o acesso à câmera nas configurações do navegador')
    expect(f.el.querySelector('.camera__estado').getAttribute('role')).toBe('alert')
    f.botao('Tentar novamente').click()
    await flushPromises()
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(2)
    f.montagem.desmontar()
  })

  // No RoqueOS, a câmera que não abre por outro motivo (ocupada, inexistente) deixava o visor
  // preto e mudo: o estado só aparecia com `error`, que ninguém preenchia.
  it('câmera indisponível por outro motivo também diz o que houve', async () => {
    prepararCamera({ falha: { name: 'NotReadableError' } })
    const f = montar()
    await vi.waitFor(() => expect(f.texto()).toContain('Câmera indisponível'))
    expect(f.texto()).toContain('Erro ao iniciar câmera')
    expect(f.texto()).not.toContain('Permita o acesso')
    f.montagem.desmontar()
  })

  it('foto: tira, mostra, e salva nas Imagens com o nome de sempre, e a métrica conta', async () => {
    const f = montar()
    await aoVivo(f.el)
    f.el.querySelector('.camera__disparador').click()
    await flushPromises()
    expect(f.el.querySelector('img.camera__previa').getAttribute('src')).toMatch(
      /^data:image\/jpeg/,
    )
    expect(f.registro.eventos).toEqual([{ nome: 'photo_capture', dados: {} }])

    f.botao('Salvar').click()
    await vi.waitFor(() => expect(f.registro.arquivos).toHaveLength(1))
    const [salvo] = f.registro.arquivos
    expect([salvo.pasta, salvo.tipo]).toEqual(['Imagens', 'image/jpeg'])
    expect(salvo.nome).toMatch(/^RoqueOS_Photo_\d+\.jpg$/)
    expect(f.arquivos.guardados('Imagens').map((a) => a.nome)).toEqual([salvo.nome])
    await vi.waitFor(() =>
      expect(f.registro.avisos).toEqual([
        { mensagem: 'Imagem salva em Arquivos', tipo: 'sucesso', fixo: false, titulo: 'Sucesso' },
      ]),
    )
    // Salvou: volta para a imagem ao vivo.
    await vi.waitFor(() => expect(f.el.querySelector('.camera__previa')).toBeNull())
    f.montagem.desmontar()
  })

  it('sem conta, salvar avisa que precisa entrar, a foto fica na tela e nada é gravado', async () => {
    const f = montar({ identidade: CONVIDADO })
    await aoVivo(f.el)
    f.el.querySelector('.camera__disparador').click()
    await flushPromises()
    f.botao('Salvar').click()
    await vi.waitFor(() =>
      expect(f.registro.avisos).toEqual([
        { mensagem: 'Entre na sua conta para salvar em Arquivos.', tipo: 'aviso', fixo: false },
      ]),
    )
    expect(f.registro.arquivos).toEqual([])
    expect(f.el.querySelector('img.camera__previa')).not.toBeNull()
    expect(f.botao('Baixar')).toBeTruthy()
    f.montagem.desmontar()
  })

  it('a galeria abre as Imagens no Finder, e diz isso com o nome da pasta', async () => {
    const f = montar()
    await aoVivo(f.el)
    const galeria = f.el.querySelector('.camera__galeria')
    expect(galeria.getAttribute('aria-label')).toBe('Imagens')
    galeria.click()
    await flushPromises()
    expect(f.registro.pastasAbertas).toEqual(['Imagens'])
    f.montagem.desmontar()
  })

  it('o temporizador conta até zero e só então fotografa', async () => {
    const f = montar()
    await aoVivo(f.el)
    f.botao('Configurações').click()
    await flushPromises()
    const tres = f.botao('3s')
    tres.click()
    await flushPromises()
    expect(tres.getAttribute('aria-pressed')).toBe('true')

    vi.useFakeTimers()
    f.el.querySelector('.camera__disparador').click()
    await flushPromises()
    expect(f.el.querySelector('.camera__contagem').textContent.trim()).toBe('3')
    await vi.advanceTimersByTimeAsync(2000)
    expect(f.el.querySelector('.camera__contagem').textContent.trim()).toBe('1')
    expect(f.registro.eventos).toEqual([])
    await vi.advanceTimersByTimeAsync(1000)
    expect(f.el.querySelector('.camera__contagem')).toBeNull()
    expect(f.registro.eventos.map((e) => e.nome)).toEqual(['photo_capture'])
    vi.useRealTimers()
    f.montagem.desmontar()
  })

  it('vídeo: o modo pede o microfone, grava, para, e salva como webm', async () => {
    const gravador = {
      state: 'inactive',
      start() {
        this.state = 'recording'
      },
      stop() {
        this.state = 'inactive'
        this.ondataavailable?.({ data: { size: 3 } })
        this.onstop?.()
      },
    }
    globalThis.MediaRecorder = vi.fn(() => gravador)
    const f = montar()
    await aoVivo(f.el)
    // O botão do modo, e não o disparador, que no modo vídeo também se chama "Vídeo".
    const modoVideo = () => f.el.querySelector('.camera__modo button[title="Vídeo"]')
    modoVideo().click()
    await vi.waitFor(() => expect(pedidos.at(-1)).toMatchObject({ audio: true }))
    await aoVivo(f.el)
    expect(modoVideo().getAttribute('aria-pressed')).toBe('true')
    expect(f.el.querySelector('.camera__disparador').getAttribute('aria-label')).toBe('Vídeo')

    const disparador = () => f.el.querySelector('.camera__disparador')
    disparador().click()
    await flushPromises()
    expect(disparador().classList.contains('camera__disparador--gravando')).toBe(true)
    expect(f.el.querySelector('.camera__gravando')).not.toBeNull()
    disparador().click()
    await flushPromises()
    expect(f.el.querySelector('video.camera__previa').getAttribute('src')).toBe('blob:video-1')

    f.botao('Salvar').click()
    await vi.waitFor(() => expect(f.registro.arquivos).toHaveLength(1))
    expect(f.registro.arquivos[0].nome).toMatch(/^RoqueOS_Video_\d+\.webm$/)
    expect(f.registro.arquivos[0].tipo).toBe('video/webm')
    f.montagem.desmontar()
  })

  it('descartar volta para a imagem ao vivo sem salvar nada', async () => {
    const f = montar()
    await aoVivo(f.el)
    f.el.querySelector('.camera__disparador').click()
    await flushPromises()
    f.botao('Cancelar').click()
    await flushPromises()
    expect(f.el.querySelector('.camera__previa')).toBeNull()
    expect(f.registro.arquivos).toEqual([])
    f.montagem.desmontar()
  })

  it('perfil leve: sem a malha animada e sem desfoque', async () => {
    const f = montar({ modoLeve: true })
    await aoVivo(f.el)
    expect(f.el.querySelector('.camera').classList.contains('camera--leve')).toBe(true)
    f.montagem.desmontar()
  })

  it('fechar a janela desliga a câmera e solta o ouvinte do idioma', async () => {
    const f = montar()
    await aoVivo(f.el)
    expect(trilha.stop).not.toHaveBeenCalled()
    expect(f.ouvintesVivos()).toBeGreaterThan(0)
    f.montagem.desmontar()
    expect(trilha.stop).toHaveBeenCalled()
    expect(f.el.querySelector('.camera')).toBeNull()
    expect(f.ouvintesVivos()).toBe(0)
    // Depois de desmontada, trocar o idioma não remonta nada.
    f.mudarIdioma('en-US')
    await flushPromises()
    expect(f.el.innerHTML).toBe('')
  })
})
