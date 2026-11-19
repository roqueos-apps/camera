# Integrações

_Português | [English](../INTEGRATIONS.md)_

> **Para quem:** quem mexe no lado do RoqueOS que instala e monta a Câmera, ou no `app-sdk`, e precisa saber exatamente o que atravessa a fronteira.
> **O que tem aqui:** como o RoqueOS instala o pacote, o que ele importa, o contrato de montagem, cada chamada que o app faz ao `sistema`, as APIs do navegador que ele usa direto, e o que nunca pode mudar.
> **Onde ir para o resto:** os fluxos em diagrama, [ARQUITETURA.md](ARQUITETURA.md#5-os-fluxos-principais); o formato dos campos, [REFERENCIA.md](REFERENCIA.md#formatos).

## Sumário

1. [Como o RoqueOS a instala](#1-como-o-roqueos-a-instala)
2. [O contrato de montagem](#2-o-contrato-de-montagem)
3. [O que o app pede ao sistema](#3-o-que-o-app-pede-ao-sistema)
4. [O que ela pega direto do navegador](#4-o-que-ela-pega-direto-do-navegador)
5. [O que nunca muda](#5-o-que-nunca-muda)

## 1. Como o RoqueOS a instala

O RoqueOS lista a Câmera como dependência git pinada numa tag, e carrega sob demanda pelos carregadores de apps gerados dele. Em 18/11/2026 o front do RoqueOS tinha:

```json
"@roqueos-apps/camera": "git+ssh://git@github.com/roqueos-apps/camera.git#v0.1.3"
```

e `ROSCamera: () => import('@roqueos-apps/camera')`. Quem compila o app é o Vite do próprio RoqueOS; o [`vite.config.js`](../../vite.config.js) daqui serve só ao `yarn dev` e ao `yarn test`. O RoqueOS lê também o `paridade.json` do pacote instalado ([TESTES.md](TESTES.md#4-paridade-testes-que-o-roqueos-lê)), e o teste de arquitetura `apps-fora-do-nucleo` dele registra a Câmera como saída em 2026-09-28, de `src/components/roqueos/apps/ROSCamera.vue`, `src/components/roqueos/apps/camera/` e `src/composables/useCamera.js`.

## 2. O contrato de montagem

A entrada do pacote é o export padrão do [`src/index.js`](../../src/index.js):

| Membro                                    | Valor                                           | Significado                                                                        |
| ----------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------- |
| `id`                                      | `camera`                                        | o mesmo do `app.json`                                                              |
| `versaoDoContrato`                        | a versão do contrato do SDK (`1` no `app.json`) | posta pelo `definirApp`                                                            |
| `capacidades`                             | `['arquivos']`                                  | conferidas pelo `verificarSistema` antes de montar                                 |
| `mount(el, sistema, { windowId, ativo })` | devolve `{ ativar(sim), desmontar() }`          | o `ativar` segue o foco da janela; o `desmontar` desmonta o Vue e desliga a câmera |

O `mount` lança `[camera] o sistema não cumpre o contrato: ...` se o sistema não tiver `arquivos`. O app cria o próprio app Vue dentro do `el`: nenhuma store, plugin ou estilo global do RoqueOS chega lá.

## 3. O que o app pede ao sistema

| Chamada                                                               | Quando                                                  | Resposta que o app trata                                                                           |
| --------------------------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `sistema.idioma.atual()`, `sistema.idioma.aoMudar(fn)`                | ao montar, e a cada troca de idioma com a janela aberta | a função de parar é chamada no `desmontar`                                                         |
| `sistema.desempenho.modoLeve()`                                       | uma vez, ao montar                                      | `true` liga o visual leve                                                                          |
| `sistema.arquivos.salvar({ nome, conteudo, tipo, pasta: 'Imagens' })` | Salvar                                                  | sucesso: aviso e volta à imagem ao vivo; `sem-conta`: aviso, captura mantida; outro: aviso de erro |
| `sistema.arquivos.abrirPasta('Imagens')`                              | o botão da galeria                                      | `sem-conta`: aviso; outro: registrado como `[camera] abrir as Imagens`                             |
| `sistema.avisar(texto, { tipo, titulo })`                             | depois de Baixar, Salvar e nos erros                    | nenhuma                                                                                            |
| `sistema.metricas.evento('photo_capture')`                            | uma vez por foto de fato desenhada                      | nenhuma                                                                                            |

## 4. O que ela pega direto do navegador

`navigator.mediaDevices.getUserMedia` e `enumerateDevices`, `MediaStreamTrack.getCapabilities`, `getSettings` e `applyConstraints` (zoom, lanterna), `MediaRecorder`, o `toDataURL` do canvas, `DeviceOrientationEvent` (e o `requestPermission` no iOS), `navigator.share` com arquivos, e um `<a download>` para Baixar ([`src/useCamera.js`](../../src/useCamera.js), [`src/Camera.vue`](../../src/Camera.vue)). O SDK não tem capacidade `camera`, porque o sistema não media nada ali.

## 5. O que nunca muda

| Nome                                | Por quê                                                                       |
| ----------------------------------- | ----------------------------------------------------------------------------- |
| `id` `camera`                       | é por ele que o RoqueOS acha a janela, o atalho e o lugar dela no Big Picture |
| `RoqueOS_Photo_` e `RoqueOS_Video_` | um começo novo separa as capturas novas das antigas nas Imagens               |
| `photo_capture`                     | o histórico da métrica depende dele                                           |
| `Imagens`                           | a pasta em que as pessoas já têm as capturas                                  |
