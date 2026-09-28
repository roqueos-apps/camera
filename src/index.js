// A porta de entrada da Câmera do RoqueOS: o app como o app-sdk entende um app.
//
// `montar` recebe o elemento, o sistema e se a janela está ativa, cria um app Vue próprio
// dentro do elemento e devolve `{ ativar, desmontar }`. Nenhuma store, nenhum plugin e nenhum
// estilo global do RoqueOS chega aqui dentro; o que a Câmera precisa vem pelo `sistema`:
//
//   arquivos   salvar a foto ou o vídeo nas Imagens da pessoa, e abrir as Imagens no Finder
//
// A câmera em si o app pede direto ao navegador (`getUserMedia`): o sistema não media nada ali,
// e é por isso que não existe capacidade `camera` no SDK.
//
// As capacidades são as mesmas do `app.json`: o teste `app.spec.js` confere que as duas listas
// batem, porque o build do RoqueOS não deixa este arquivo importar o JSON.

import { createApp, reactive } from 'vue'
import { definirApp } from '@roqueos-apps/app-sdk'
import Camera from './Camera.vue'
import { carregarTextos } from './textos.js'

export const CAPACIDADES = Object.freeze(['arquivos'])

export default definirApp({
  id: 'camera',
  capacidades: [...CAPACIDADES],
  montar(el, sistema, { ativo }) {
    const estado = reactive({
      ativo,
      idioma: sistema.idioma.atual(),
      textos: null,
      leve: sistema.desempenho.modoLeve(),
    })
    let app = null
    let desmontado = false
    // Duas trocas de idioma seguidas podem voltar fora de ordem; vale a última.
    let pedido = 0

    const trocarIdioma = async (idioma) => {
      const meu = ++pedido
      const textos = await carregarTextos(idioma)
      if (desmontado || meu !== pedido) return
      estado.idioma = idioma
      estado.textos = textos
    }
    const pararIdioma = sistema.idioma.aoMudar((novo) => {
      trocarIdioma(novo).catch((erro) => console.error('[camera] textos do idioma', novo, erro))
    })

    // O app só monta com o texto na mão: montar antes mostraria botões sem rótulo.
    trocarIdioma(estado.idioma)
      .catch((erro) => console.error('[camera] textos do idioma', estado.idioma, erro))
      .finally(() => {
        if (desmontado) return
        app = createApp(Camera, { sistema, estado })
        app.mount(el)
      })

    return {
      ativar(sim) {
        estado.ativo = sim
      },
      // Desmontar o app Vue desmonta a tela, e o `onUnmounted` do motor desliga a câmera: a
      // luz do aparelho apaga quando a janela fecha.
      desmontar() {
        desmontado = true
        pararIdioma?.()
        app?.unmount()
        app = null
      },
    }
  },
})
