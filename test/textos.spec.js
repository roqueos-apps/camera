// Toda chave de texto que a tela pede existe nos dez idiomas, e nenhum idioma tem chave que a
// tela não pede. O `app check` do SDK confere que os dez JSON têm as mesmas chaves; o que ele
// não vê é a chave escrita no código e esquecida nos JSON (a tela mostraria o nome da chave), e a
// chave que sobrou de um texto que saiu.
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { IDIOMAS_COM_TEXTO, traduzir } from '../src/textos.js'

const raiz = join(import.meta.dirname, '..')
const tela = readFileSync(join(raiz, 'src/Camera.vue'), 'utf8')

// `t('chave')` na tela, e os valores do mapa de rótulo da grade (`t(ROTULO_DA_GRADE[g])`).
const pedidas = new Set([...tela.matchAll(/\bt\('([A-Za-z]+)'\)/g)].map((m) => m[1]))
const grade = tela.match(/const ROTULO_DA_GRADE = \{([^}]+)\}/)[1]
for (const m of grade.matchAll(/'([A-Za-z]+)'/g)) pedidas.add(m[1])

describe('os textos da Câmera', () => {
  it('a tela pede chaves, e o mapa da grade foi lido', () => {
    expect(pedidas.size).toBeGreaterThan(20)
    expect([...pedidas]).toEqual(expect.arrayContaining(['gridNone', 'gridThirds', 'gridPhi']))
  })

  it('há um JSON por idioma, e só os dez', () => {
    const arquivos = readdirSync(join(raiz, 'i18n')).map((n) => n.replace(/\.json$/, ''))
    expect(arquivos.sort()).toEqual([...IDIOMAS_COM_TEXTO].sort())
  })

  for (const idioma of IDIOMAS_COM_TEXTO) {
    it(`${idioma}: tem toda chave que a tela pede, e nenhuma a mais`, () => {
      const textos = JSON.parse(readFileSync(join(raiz, 'i18n', `${idioma}.json`), 'utf8'))
      const faltam = [...pedidas].filter((c) => traduzir(textos, c) === c || !textos[c].trim())
      const sobram = Object.keys(textos).filter((c) => !pedidas.has(c))
      expect({ faltam, sobram }).toEqual({ faltam: [], sobram: [] })
    })
  }
})
