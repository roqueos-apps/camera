# Referência

_Português | [English](../REFERENCE.md)_

> **Para quem:** quem precisa consultar alguma coisa, não ler do começo ao fim.
> **O que tem aqui:** todo comando e script, os parâmetros de URL do desenvolvimento, todo arquivo e pasta com quem escreve e quem lê, os exports do pacote, as constantes e os estados do motor, as variáveis CSS, os códigos e nomes que atravessam fronteira, e o formato do `app.json`, dos arquivos de texto e do `paridade.json`.
> **Onde ir para o resto:** por que as coisas são assim, [ARQUITETURA.md](ARQUITETURA.md); as palavras, [GLOSSARIO.md](GLOSSARIO.md).

## Sumário

1. [Comandos](#comandos)
2. [Scripts](#scripts)
3. [Parâmetros de URL do desenvolvimento](#parâmetros-de-url-do-desenvolvimento)
4. [Arquivos e pastas](#arquivos-e-pastas)
5. [Exports do pacote](#exports-do-pacote)
6. [Constantes e estados do motor](#constantes-e-estados-do-motor)
7. [Variáveis CSS](#variáveis-css)
8. [Nomes e códigos que atravessam fronteira](#nomes-e-códigos-que-atravessam-fronteira)
9. [Formatos](#formatos)

## Comandos

Todos da raiz do repositório, com Yarn 1 ([`package.json`](../../package.json)).

| Comando                                           | O que faz                                                                                     | Exemplo                                                                 |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `yarn install --ignore-scripts`                   | instala as dependências sem rodar script de instalação nenhum                                 | a primeira vez, e depois de um pull que mudou o `yarn.lock`             |
| `yarn install --frozen-lockfile --ignore-scripts` | o mesmo, reprovando se o `yarn.lock` fosse mudar; é o que o CI roda                           | reproduzir o CI                                                         |
| `yarn dev`                                        | `vite`: a Câmera sozinha numa janela falsa do RoqueOS                                         | `yarn dev`, depois o endereço que o Vite imprime                        |
| `yarn verificar`                                  | `yarn lint && yarn format:check && yarn test && yarn app:check`: o gate do CI e do `pre-push` | antes de todo push                                                      |
| `yarn test`                                       | `vitest run`: as quatro suítes de `test/`                                                     | `yarn test test/useCamera.spec.js`                                      |
| `yarn lint`                                       | `eslint .` com o [`eslint.config.js`](../../eslint.config.js)                                 | depois de mudar `.js` ou `.vue`                                         |
| `yarn format`                                     | `prettier --write .` (Markdown incluído)                                                      | depois de editar qualquer documento                                     |
| `yarn format:check`                               | `prettier --check .`                                                                          | o que o gate roda                                                       |
| `yarn app:check`                                  | `app check`: o repositório contra o contrato do RoqueOS                                       | depois de mexer no `app.json`, em `i18n/`, em import ou em variável CSS |
| `git commit -s`                                   | commit com `Signed-off-by`, que o workflow `dco` exige                                        | todo commit                                                             |

## Scripts

| Script                                                                                        | Entrada                                                                                                                                                       | Saída                                                                                                                               | Códigos de saída                                                                       |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `app check` (do `@roqueos-apps/app-sdk`, `bin/app.mjs`)                                       | a pasta atual, ou `app check <pasta>`; `--json` para saída de máquina                                                                                         | uma linha por seção, `ok` ou `REPROVOU`, cada problema recuado embaixo, e então `ok, o repo cumpre o contrato.` ou `N problema(s).` | 0 limpo, 1 qualquer problema, 2 uso errado (`uso: app check [pasta] [--sdk] [--json]`) |
| `vitest run`                                                                                  | `test/**/*.spec.js`, jsdom, preparo [`test/preparar.js`](../../test/preparar.js) ([`vite.config.js`](../../vite.config.js))                                   | o resultado por arquivo e por teste                                                                                                 | 0 tudo passou, 1 qualquer falha                                                        |
| `prettier --check .`                                                                          | todo arquivo fora do [`.prettierignore`](../../.prettierignore) (`node_modules`, `yarn.lock`, `dist`, `public`), regras no [`.prettierrc`](../../.prettierrc) | `[warn] <arquivo>` por arquivo fora do formato                                                                                      | 0 limpo, 1 qualquer arquivo fora do formato                                            |
| `eslint .`                                                                                    | tudo menos `node_modules/` e `dist/`                                                                                                                          | uma linha por problema                                                                                                              | 0 limpo, 1 qualquer erro                                                               |
| `node scripts/paridade-dos-apps.mjs ../camera` (no repositório do front do RoqueOS, não aqui) | a pasta do app                                                                                                                                                | `paridade ok: 48 funcionalidades (...)` ou um `paridade: <problema>` por linha                                                      | 0 ok, 1 problema, 2 uso errado                                                         |

## Parâmetros de URL do desenvolvimento

Lidos pelo sistema de desenvolvimento do SDK que o [`dev/main.js`](../../dev/main.js) monta.

| Parâmetro          | Padrão                                                    | O que muda                                                                             |
| ------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `?idioma=<idioma>` | o idioma do navegador, normalizado para um dos dez        | abre num dos dez idiomas, por exemplo `ja-JP`; `ar-AR` vira da direita para a esquerda |
| `?leve=1`          | o palpite do próprio SDK (tela de toque ou pouca memória) | força o perfil leve: sem a malha animada, sem desfoque, contagem sem pulsar            |
| `?convidado=1`     | uma conta local                                           | sem conta: Salvar e a galeria recusam com `sem-conta`, Baixar e Compartilhar continuam |

## Arquivos e pastas

| Caminho                                                              | O que guarda                                                                                       | Quem escreve                             | Quem lê                                                         |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------- |
| [`app.json`](../../app.json)                                         | o manifesto do app                                                                                 | o mantenedor                             | o RoqueOS, o `app check`, o `dev/main.js`, o `test/app.spec.js` |
| [`package.json`](../../package.json)                                 | nome `@roqueos-apps/camera`, versão, exports, `files`, scripts, dependências pinadas               | o mantenedor, na versão                  | o Yarn, a instalação do RoqueOS                                 |
| [`yarn.lock`](../../yarn.lock)                                       | os commits exatos do `app-sdk` e do `ui` e de toda dependência de desenvolvimento                  | o Yarn                                   | o CI, o RoqueOS                                                 |
| [`src/`](../../src/index.js)                                         | o app: entrada, tela, motor, carregador de textos, estilo                                          | quem contribui                           | o build do RoqueOS, o Vite, o Vitest                            |
| [`i18n/`](../../i18n/en-US.json)                                     | dez JSON: `pt-BR`, `en-US`, `es-ES`, `fr-FR`, `de-DE`, `ja-JP`, `zh-CN`, `hi-IN`, `ru-RU`, `ar-AR` | quem contribui                           | o `src/textos.js`, o `app check`, o `test/textos.spec.js`       |
| [`dev/main.js`](../../dev/main.js), [`index.html`](../../index.html) | a janela falsa avulsa                                                                              | quem contribui                           | o `yarn dev`                                                    |
| [`test/`](../../test/app.spec.js)                                    | `app.spec.js`, `useCamera.spec.js`, `textos.spec.js`, `estilo.spec.js`, `preparar.js`              | quem contribui                           | o Vitest; o RoqueOS lê os títulos citados no `paridade.json`    |
| [`paridade.json`](../../paridade.json)                               | o inventário das funcionalidades de antes da saída                                                 | o mantenedor, no mesmo commit da mudança | a conferência de paridade do RoqueOS                            |
| [`ASSETS.md`](../../ASSETS.md)                                       | origem e licença das mídias                                                                        | o mantenedor                             | o `app check`                                                   |
| [`CHANGELOG.md`](../../CHANGELOG.md)                                 | o que mudou por versão, Keep a Changelog                                                           | toda mudança                             | as pessoas, o mantenedor do RoqueOS                             |
| [`docs/`](INDEX.md)                                                  | esta documentação, o `docs.json` e a capa `capa.jpg`                                               | quem contribui                           | as pessoas; fora do pacote (o `files` não leva)                 |
| [`.github/workflows/`](../../.github/workflows/ci.yml)               | `ci.yml` (`verificar`) e `dco.yml`                                                                 | o mantenedor                             | o GitHub Actions                                                |
| [`.claude/`](../../.claude/loop.md)                                  | `loop.md` (a rotina de manutenção) e `settings.json` (o plugin do kit e as permissões)             | o mantenedor                             | o Claude Code                                                   |

## Exports do pacote

| Export                          | Arquivo                                                                                                                                                  | Quem usa                           |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `@roqueos-apps/camera`          | [`src/index.js`](../../src/index.js): o objeto padrão do `definirApp(...)` (`id`, `versaoDoContrato`, `capacidades`, `mount`), e o nomeado `CAPACIDADES` | os carregadores de apps do RoqueOS |
| `@roqueos-apps/camera/app.json` | [`app.json`](../../app.json)                                                                                                                             | o registro do RoqueOS              |

Os `files` publicados são `src`, `i18n`, `app.json`, `paridade.json`, `ASSETS.md`, `LICENSE` e `README.md`.

## Constantes e estados do motor

Do [`src/useCamera.js`](../../src/useCamera.js) e do [`src/Camera.vue`](../../src/Camera.vue).

| Nome                    | Valores                                                                            | Padrão        |
| ----------------------- | ---------------------------------------------------------------------------------- | ------------- |
| `CAMERA_RESOLUTIONS`    | `sd` 480p 640x480, `hd` 720p 1280x720, `fhd` 1080p 1920x1080, `4k` 4K 3840x2160    | `hd`          |
| `CAMERA_ASPECTS`        | `full` (sem recorte), `square` 1:1, `4_3`, `16_9`                                  | `full`        |
| `CAMERA_GRID_TYPES`     | `none`, `thirds`, `phi`                                                            | `thirds`      |
| temporizador (`TEMPOS`) | 0, 3, 5, 10 segundos                                                               | 0             |
| `status`                | `idle`, `requesting`, `streaming`, `denied`, `error`                               | `idle`        |
| `facingMode`            | `environment`, `user`                                                              | `environment` |
| `mode`                  | `photo`, `video`                                                                   | `photo`       |
| `mirrorFront`           | espelha a câmera frontal na tela e na foto                                         | `true`        |
| faixa do zoom           | a capacidade `zoom` do aparelho; sem ela, de 1 a 4 por recorte                     | 1             |
| foto                    | JPEG, qualidade 0,95                                                               |               |
| vídeo                   | `video/webm;codecs=vp9,opus`, ou o padrão do navegador; Blob rotulado `video/webm` |               |

## Variáveis CSS

| Variável                                                                                                                                                                                        | De onde vem                                                 | Efeito                                                                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `--camera-acento`, `--camera-acento-rgb`                                                                                                                                                        | postas inline pelo `Camera.vue` (`#10b981`, `16, 185, 129`) | o verde da Câmera: foco, opções ativas, disparador                                                                |
| `--camera-*` (`fundo`, `superficie`, `vidro`, `borda`, `borda-2`, `texto`, `texto-2`, `texto-3`, `realce`, `perigo`, `desfoque`, `transicao`, `proporcao`, `fora-da-proporcao`, `tinta-escura`) | [`src/camera.scss`](../../src/camera.scss)                  | a paleta e os tempos do próprio app, feitos sobre o tema                                                          |
| `--ros-fill-rgb`, `--ros-white-rgb`, `--ros-text-rgb`, `--ros-scrim-rgb`, `--ros-surface-0-rgb`, `--ros-line-rgb`, `--ros-danger-rgb`, `--ros-shadow-rgb`, `--ros-text-100`                     | o contrato do SDK, fornecidas pelo RoqueOS                  | as cores do tema; o `app check` reprova `--ros-` fora da lista do contrato, e qualquer `--ros-` que o app declare |
| `--safe-area-inset-bottom`                                                                                                                                                                      | congelada pelo RoqueOS no app do iPhone                     | a margem de baixo, com o `env(safe-area-inset-bottom)` só de reserva                                              |

## Nomes e códigos que atravessam fronteira

| Nome                                                                                                                                               | Onde                                                      | Regra                                           |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------- |
| `camera`                                                                                                                                           | `id` no `app.json` e no `src/index.js`                    | permanente                                      |
| `RoqueOS_Photo_<Date.now()>.jpg`, `RoqueOS_Video_<Date.now()>.webm`                                                                                | `nomeDoArquivo()` no `Camera.vue`                         | começo permanente                               |
| `Imagens`                                                                                                                                          | `pastas` no `app.json`, `pasta` no `salvar`, `abrirPasta` | a única pasta que o app pode abrir              |
| `photo_capture`                                                                                                                                    | `sistema.metricas.evento`, uma vez por foto tirada        | o nome de antes da saída                        |
| `sem-conta`                                                                                                                                        | `erro.codigo` do `arquivos.salvar` e do `abrirPasta`      | mostra o `semConta`, mantém a captura           |
| `[useCamera] start failed:`, `[useCamera] MediaRecorder unsupported:`, `[camera] salvar`, `[camera] abrir as Imagens`, `[camera] textos do idioma` | console                                                   | prefixos de log, úteis para procurar no console |

## Formatos

### `app.json`

| Campo               | Valor aqui                                                     | Significado                                    |
| ------------------- | -------------------------------------------------------------- | ---------------------------------------------- |
| `id`                | `camera`                                                       | identidade permanente                          |
| `versaoDoContrato`  | `1`                                                            | versão do contrato do SDK                      |
| `camada`            | `primeira-parte`                                               | app de primeira parte                          |
| `nome`, `descricao` | um objeto com os dez idiomas                                   | nome e descrição no registro                   |
| `icone`             | `photo_camera`                                                 | nome do Material Icons, desenhado pelo RoqueOS |
| `cor`               | `#10b981`                                                      | cor do app                                     |
| `categoria`         | `media`                                                        | categoria no registro                          |
| `janela`            | `largura` 800, `altura` 600, `minLargura` 360, `minAltura` 420 | tamanho da janela                              |
| `capacidades`       | `["arquivos"]`                                                 | as capacidades opcionais que ele pede          |
| `pastas`            | `["Imagens"]`                                                  | as pastas que ele pode abrir                   |
| `autor`, `licenca`  | `Roque Ribeiro`, `MIT`                                         | autoria e licença                              |

### `i18n/<idioma>.json`

Um objeto plano, chave para texto não vazio, as mesmas chaves nos dez arquivos. Chave não tem ponto (o `app check` lê ponto como caminho). Exemplo do [`i18n/en-US.json`](../../i18n/en-US.json):

```json
{ "title": "Camera", "errorTitle": "Camera unavailable", "imagens": "Pictures" }
```

### `paridade.json`

| Campo               | Significado                                                                                                                                                                                              |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `versao`            | sempre `1`                                                                                                                                                                                               |
| `app`               | o `id` (`camera`)                                                                                                                                                                                        |
| `antes`             | onde o app morava antes da saída                                                                                                                                                                         |
| `auditoria`         | quando e como o inventário foi feito (28/09/2026, linha a linha)                                                                                                                                         |
| `funcionalidades[]` | uma por funcionalidade: `o_que`, `estado` (`mantida`, `mudou` ou `perdida`), `testes` (`test/<arquivo> › <título exato do it()>`), `evidencia`; `nota` é obrigatória em `mudou` e `decisao` em `perdida` |
