// O que o estilo da Câmera precisa manter do RoqueOS de antes, e que nenhum teste de tela vê.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const scss = readFileSync(join(process.cwd(), 'src/camera.scss'), 'utf8')

describe('o estilo da Câmera', () => {
  it('a margem de baixo do celular usa a do RoqueOS, com o env() só de reserva', () => {
    // No app do iPhone o RoqueOS congela a área da barra de gestos em --safe-area-inset-bottom,
    // porque o env() zera quando uma folha trava o body, e zera de novo com o teclado aberto.
    // A Câmera de antes usava a variável; o env() sozinho põe o disparador embaixo da barra.
    const usos = [...scss.matchAll(/env\(\s*safe-area-inset-bottom/g)]
    expect(usos.length).toBeGreaterThan(0)
    for (const uso of usos) {
      const antes = scss.slice(Math.max(0, uso.index - 40), uso.index)
      expect(antes).toMatch(/var\(--safe-area-inset-bottom,\s*$/)
    }
  })
})
