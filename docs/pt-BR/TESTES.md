# Testes

_Português | [English](../TESTING.md)_

> **Para quem:** quem muda a Câmera e precisa saber que teste cobre o quê, e o que o gate aceita.
> **O que tem aqui:** o critério de aceite, o que cada suíte prova, como o navegador é imitado, como o `paridade.json` liga os testes ao RoqueOS, e o que nenhum teste prova.
> **Onde ir para o resto:** quando um teste falha, [QUANDO-QUEBRA.md](QUANDO-QUEBRA.md#o-gate); os comandos, [REFERENCIA.md](REFERENCIA.md#comandos).

## Sumário

1. [O critério de aceite](#1-o-critério-de-aceite)
2. [As suítes](#2-as-suítes)
3. [Como o navegador é imitado](#3-como-o-navegador-é-imitado)
4. [Paridade: testes que o RoqueOS lê](#4-paridade-testes-que-o-roqueos-lê)
5. [O que nenhum teste prova](#5-o-que-nenhum-teste-prova)

## 1. O critério de aceite

Uma mudança é aceita quando o `yarn verificar` passa, que é o que o CI e o `pre-push` rodam:

```bash
yarn verificar
```

Ele roda, em ordem e parando na primeira falha: `eslint .`, `prettier --check .`, `vitest run` e `app check`. Medido em 18/11/2026: 4 arquivos, 47 testes, toda seção do `app check` `ok`. Toda correção vem com um teste que reprova sem ela, e check novo passa por mutação ([CLAUDE.md](../../CLAUDE.md)). Mudança visível precisa também do app aberto de verdade no `yarn dev`, com print ([`.claude/loop.md`](../../.claude/loop.md)).

## 2. As suítes

| Suíte                                                    | O que prova                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Testes em 18/11/2026 |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| [`test/app.spec.js`](../../test/app.spec.js)             | o app como o SDK o vê, montado com o sistema falso do SDK e o motor de verdade: id e capacidades iguais às do manifesto, câmera traseira e os botões que o aparelho sustenta, os estados de carregando, negado e indisponível, troca de idioma com a janela aberta, foto salva nas Imagens com o nome permanente e a métrica, a recusa sem conta, a galeria abrindo as Imagens, o temporizador, vídeo com microfone salvo como webm, descartar, perfil leve, e fechar a janela desligando a câmera | 16                   |
| [`test/useCamera.spec.js`](../../test/useCamera.spec.js) | o motor sozinho: início do stream, sondagem das capacidades, uma ou nenhuma câmera não é "várias câmeras", o zoom por CSS recortando o centro, a faixa de zoom que o aparelho declara, permissão negada, troca de câmera e de resolução, captura espelhada, zoom nativo e por CSS, lanterna, Blob do vídeo, descartar revogando a URL `blob:`, a métrica uma vez por foto, trilhas paradas ao desmontar                                                                                            | 18                   |
| [`test/textos.spec.js`](../../test/textos.spec.js)       | todo `t('chave')` da tela e todo valor do `ROTULO_DA_GRADE` existe, não vazio, em cada um dos dez idiomas, e nenhum idioma guarda chave que a tela não pede; há um JSON por idioma e só dez                                                                                                                                                                                                                                                                                                        | 12                   |
| [`test/estilo.spec.js`](../../test/estilo.spec.js)       | todo `env(safe-area-inset-bottom)` do `camera.scss` é reserva dentro de `var(--safe-area-inset-bottom, ...)`                                                                                                                                                                                                                                                                                                                                                                                       | 1                    |

A suíte do motor veio do RoqueOS (`tests/unit/composables/useCamera.spec.js`) sem mudança nos casos; só a métrica é nova ([`test/useCamera.spec.js`](../../test/useCamera.spec.js)).

## 3. Como o navegador é imitado

O Vitest roda sobre jsdom ([`vite.config.js`](../../vite.config.js)). O [`test/preparar.js`](../../test/preparar.js) supre um `ResizeObserver` e um `matchMedia` vazios, e desmonta todo componente no fim de cada teste. O [`test/app.spec.js`](../../test/app.spec.js) define um `navigator.mediaDevices` com duas câmeras e uma trilha com `torch`, e imita o `play`, um quadro de 640x360, o contexto do canvas, o `toDataURL`, um `fetch` que devolve um Blob, e o `URL.createObjectURL`. O sistema falso registra o que o app fez (`avisos`, `eventos`, `arquivos`), e os testes leem esse registro.

## 4. Paridade: testes que o RoqueOS lê

Cada item do [`paridade.json`](../../paridade.json) cita testes como `test/<arquivo> › <título exato do it()>`. O RoqueOS confere, no pacote instalado, que cada arquivo e título citado ainda existe. Renomear um teste citado ali quebra a conferência do RoqueOS: mude a citação no mesmo commit. Rode a conferência de um checkout do RoqueOS ao lado deste repositório:

```bash
node scripts/paridade-dos-apps.mjs ../camera
```

## 5. O que nenhum teste prova

- O comportamento numa câmera, num `MediaRecorder` e num `DeviceOrientation` de verdade: tudo imitado. Conferido à mão no `yarn dev` e dentro do RoqueOS.
- O 720p padrão (o primeiro item do `paridade.json` diz isso).
- O layout: a regra compacta do `@container` e o visual não são afirmados por teste nenhum, fora a regra da área segura.
- A documentação: o `roqueos-docs` não faz parte do `yarn verificar`.
