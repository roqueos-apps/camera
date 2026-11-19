# Reference

_[Português](pt-BR/REFERENCIA.md) | English_

> **For whom:** whoever needs to look something up, not read from start to end.
> **What is here:** every command and script, the dev query parameters, every file and folder with who writes and reads it, the package exports, the engine's constants and states, the CSS variables, the codes and names that cross a boundary, and the format of `app.json`, the text files and `paridade.json`.
> **Where to go for the rest:** why things are this way, [ARCHITECTURE.md](ARCHITECTURE.md); the words, [GLOSSARY.md](GLOSSARY.md).

## Table of contents

1. [Commands](#commands)
2. [Scripts](#scripts)
3. [Dev query parameters](#dev-query-parameters)
4. [Files and folders](#files-and-folders)
5. [Package exports](#package-exports)
6. [Engine constants and states](#engine-constants-and-states)
7. [CSS variables](#css-variables)
8. [Names and codes that cross a boundary](#names-and-codes-that-cross-a-boundary)
9. [Formats](#formats)

## Commands

All from the repository root, with Yarn 1 ([`package.json`](../package.json)).

| Command                                           | What it does                                                                                   | Example                                                      |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `yarn install --ignore-scripts`                   | installs the dependencies without running any install script                                   | first time, and after a pull that changed `yarn.lock`        |
| `yarn install --frozen-lockfile --ignore-scripts` | the same, failing if `yarn.lock` would change; what CI runs                                    | reproducing CI                                               |
| `yarn dev`                                        | `vite`: the Camera alone in a fake RoqueOS window                                              | `yarn dev`, then the address Vite prints                     |
| `yarn verificar`                                  | `yarn lint && yarn format:check && yarn test && yarn app:check`: the gate of CI and `pre-push` | before every push                                            |
| `yarn test`                                       | `vitest run`: the four suites in `test/`                                                       | `yarn test test/useCamera.spec.js`                           |
| `yarn lint`                                       | `eslint .` with [`eslint.config.js`](../eslint.config.js)                                      | after changing `.js` or `.vue`                               |
| `yarn format`                                     | `prettier --write .` (Markdown included)                                                       | after editing any doc                                        |
| `yarn format:check`                               | `prettier --check .`                                                                           | what the gate runs                                           |
| `yarn app:check`                                  | `app check`: the repository against the RoqueOS contract                                       | after touching `app.json`, `i18n/`, imports or CSS variables |
| `git commit -s`                                   | commit with `Signed-off-by`, which the `dco` workflow demands                                  | every commit                                                 |

## Scripts

| Script                                                                                     | Input                                                                                                                                               | Output                                                                                                                          | Exit codes                                                                        |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `app check` (from `@roqueos-apps/app-sdk`, `bin/app.mjs`)                                  | the current folder, or `app check <folder>`; `--json` for machine output                                                                            | one line per section, `ok` or `REPROVOU`, each problem indented below, then `ok, o repo cumpre o contrato.` or `N problema(s).` | 0 clean, 1 any problem, 2 wrong usage (`uso: app check [pasta] [--sdk] [--json]`) |
| `vitest run`                                                                               | `test/**/*.spec.js`, jsdom, setup [`test/preparar.js`](../test/preparar.js) ([`vite.config.js`](../vite.config.js))                                 | the result per file and test                                                                                                    | 0 all passed, 1 any failure                                                       |
| `prettier --check .`                                                                       | every file not in [`.prettierignore`](../.prettierignore) (`node_modules`, `yarn.lock`, `dist`, `public`), rules in [`.prettierrc`](../.prettierrc) | `[warn] <file>` per file out of format                                                                                          | 0 clean, 1 any file out of format                                                 |
| `eslint .`                                                                                 | everything but `node_modules/` and `dist/`                                                                                                          | one line per problem                                                                                                            | 0 clean, 1 any error                                                              |
| `node scripts/paridade-dos-apps.mjs ../camera` (in the RoqueOS front repository, not here) | the app folder                                                                                                                                      | `paridade ok: 48 funcionalidades (...)` or one `paridade: <problem>` per line                                                   | 0 ok, 1 problem, 2 wrong usage                                                    |

## Dev query parameters

Read by the SDK's development system that [`dev/main.js`](../dev/main.js) mounts.

| Parameter            | Default                                             | What changes                                                                            |
| -------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `?idioma=<language>` | the browser language, normalized to one of the ten  | opens in one of the ten languages, for example `ja-JP`; `ar-AR` turns right to left     |
| `?leve=1`            | the SDK's own guess (touch screen or little memory) | forces the light profile: no animated mesh, no blur, countdown without pulse            |
| `?convidado=1`       | a local account                                     | no account: Save and the gallery refuse with `sem-conta`, Download and Share still work |

## Files and folders

| Path                                                           | What it keeps                                                                                            | Who writes                                       | Who reads                                                 |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------- |
| [`app.json`](../app.json)                                      | the app manifest                                                                                         | the maintainer                                   | RoqueOS, `app check`, `dev/main.js`, `test/app.spec.js`   |
| [`package.json`](../package.json)                              | name `@roqueos-apps/camera`, version, exports, `files`, scripts, pinned dependencies                     | the maintainer at release                        | Yarn, RoqueOS's install                                   |
| [`yarn.lock`](../yarn.lock)                                    | the exact commits of `app-sdk` and `ui` and every dev dependency                                         | Yarn                                             | CI, RoqueOS                                               |
| [`src/`](../src/index.js)                                      | the app: entry, screen, engine, texts loader, style                                                      | contributors                                     | RoqueOS's build, Vite, Vitest                             |
| [`i18n/`](../i18n/en-US.json)                                  | ten JSON files: `pt-BR`, `en-US`, `es-ES`, `fr-FR`, `de-DE`, `ja-JP`, `zh-CN`, `hi-IN`, `ru-RU`, `ar-AR` | contributors                                     | `src/textos.js`, `app check`, `test/textos.spec.js`       |
| [`dev/main.js`](../dev/main.js), [`index.html`](../index.html) | the standalone fake window                                                                               | contributors                                     | `yarn dev`                                                |
| [`test/`](../test/app.spec.js)                                 | `app.spec.js`, `useCamera.spec.js`, `textos.spec.js`, `estilo.spec.js`, `preparar.js`                    | contributors                                     | Vitest; RoqueOS reads the titles cited in `paridade.json` |
| [`paridade.json`](../paridade.json)                            | the inventory of features from before the move                                                           | the maintainer, in the same commit as the change | RoqueOS's parity check                                    |
| [`ASSETS.md`](../ASSETS.md)                                    | origin and licence of media                                                                              | the maintainer                                   | `app check`                                               |
| [`CHANGELOG.md`](../CHANGELOG.md)                              | what changed per version, Keep a Changelog                                                               | every change                                     | people, RoqueOS's maintainer                              |
| [`docs/`](INDEX.md)                                            | this documentation, `docs.json` and the cover `capa.jpg`                                                 | contributors                                     | people; not in the package (`files` leaves it out)        |
| [`.github/workflows/`](../.github/workflows/ci.yml)            | `ci.yml` (`verificar`) and `dco.yml`                                                                     | the maintainer                                   | GitHub Actions                                            |
| [`.claude/`](../.claude/loop.md)                               | `loop.md` (the maintenance routine) and `settings.json` (the kit plugin and permissions)                 | the maintainer                                   | Claude Code                                               |

## Package exports

| Export                          | File                                                                                                                                        | Used by               |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `@roqueos-apps/camera`          | [`src/index.js`](../src/index.js): default `definirApp(...)` object (`id`, `versaoDoContrato`, `capacidades`, `mount`), named `CAPACIDADES` | RoqueOS's app loaders |
| `@roqueos-apps/camera/app.json` | [`app.json`](../app.json)                                                                                                                   | RoqueOS's registry    |

The published `files` are `src`, `i18n`, `app.json`, `paridade.json`, `ASSETS.md`, `LICENSE` and `README.md`.

## Engine constants and states

From [`src/useCamera.js`](../src/useCamera.js) and [`src/Camera.vue`](../src/Camera.vue).

| Name                 | Values                                                                           | Default       |
| -------------------- | -------------------------------------------------------------------------------- | ------------- |
| `CAMERA_RESOLUTIONS` | `sd` 480p 640x480, `hd` 720p 1280x720, `fhd` 1080p 1920x1080, `4k` 4K 3840x2160  | `hd`          |
| `CAMERA_ASPECTS`     | `full` (no crop), `square` 1:1, `4_3`, `16_9`                                    | `full`        |
| `CAMERA_GRID_TYPES`  | `none`, `thirds`, `phi`                                                          | `thirds`      |
| timer (`TEMPOS`)     | 0, 3, 5, 10 seconds                                                              | 0             |
| `status`             | `idle`, `requesting`, `streaming`, `denied`, `error`                             | `idle`        |
| `facingMode`         | `environment`, `user`                                                            | `environment` |
| `mode`               | `photo`, `video`                                                                 | `photo`       |
| `mirrorFront`        | mirror the front camera on screen and in the photo                               | `true`        |
| zoom range           | the device's `zoom` capability; without it 1 to 4 by cropping                    | 1             |
| photo                | JPEG, quality 0.95                                                               |               |
| video                | `video/webm;codecs=vp9,opus`, or the browser default; Blob labelled `video/webm` |               |

## CSS variables

| Variable                                                                                                                                                                                        | Where it comes from                                    | Effect                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `--camera-acento`, `--camera-acento-rgb`                                                                                                                                                        | set inline by `Camera.vue` (`#10b981`, `16, 185, 129`) | the Camera green: focus, active options, shutter                                                               |
| `--camera-*` (`fundo`, `superficie`, `vidro`, `borda`, `borda-2`, `texto`, `texto-2`, `texto-3`, `realce`, `perigo`, `desfoque`, `transicao`, `proporcao`, `fora-da-proporcao`, `tinta-escura`) | [`src/camera.scss`](../src/camera.scss)                | the app's own palette and timings, built over the theme                                                        |
| `--ros-fill-rgb`, `--ros-white-rgb`, `--ros-text-rgb`, `--ros-scrim-rgb`, `--ros-surface-0-rgb`, `--ros-line-rgb`, `--ros-danger-rgb`, `--ros-shadow-rgb`, `--ros-text-100`                     | the SDK contract, supplied by RoqueOS                  | the theme colours; `app check` fails any `--ros-` outside the contract list, and any `--ros-` the app declares |
| `--safe-area-inset-bottom`                                                                                                                                                                      | frozen by RoqueOS on the iPhone app                    | bottom margin, with `env(safe-area-inset-bottom)` only as fallback                                             |

## Names and codes that cross a boundary

| Name                                                                                                                                               | Where                                                     | Rule                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------ |
| `camera`                                                                                                                                           | `id` in `app.json` and `src/index.js`                     | permanent                                  |
| `RoqueOS_Photo_<Date.now()>.jpg`, `RoqueOS_Video_<Date.now()>.webm`                                                                                | `nomeDoArquivo()` in `Camera.vue`                         | prefix permanent                           |
| `Imagens`                                                                                                                                          | `pastas` in `app.json`, `pasta` in `salvar`, `abrirPasta` | the only folder the app may open           |
| `photo_capture`                                                                                                                                    | `sistema.metricas.evento`, once per photo taken           | the name from before the move              |
| `sem-conta`                                                                                                                                        | `erro.codigo` from `arquivos.salvar` and `abrirPasta`     | shows `semConta`, keeps the capture        |
| `[useCamera] start failed:`, `[useCamera] MediaRecorder unsupported:`, `[camera] salvar`, `[camera] abrir as Imagens`, `[camera] textos do idioma` | console                                                   | log prefixes, useful to search the console |

## Formats

### `app.json`

| Field               | Value here                                                     | Meaning                               |
| ------------------- | -------------------------------------------------------------- | ------------------------------------- |
| `id`                | `camera`                                                       | permanent identity                    |
| `versaoDoContrato`  | `1`                                                            | SDK contract version                  |
| `camada`            | `primeira-parte`                                               | first-party app                       |
| `nome`, `descricao` | an object with the ten languages                               | name and description in the registry  |
| `icone`             | `photo_camera`                                                 | Material Icons name, drawn by RoqueOS |
| `cor`               | `#10b981`                                                      | app colour                            |
| `categoria`         | `media`                                                        | registry category                     |
| `janela`            | `largura` 800, `altura` 600, `minLargura` 360, `minAltura` 420 | window size                           |
| `capacidades`       | `["arquivos"]`                                                 | optional capabilities it asks for     |
| `pastas`            | `["Imagens"]`                                                  | folders it may open                   |
| `autor`, `licenca`  | `Roque Ribeiro`, `MIT`                                         | authorship and licence                |

### `i18n/<language>.json`

A flat object, key to non-empty string, the same keys in the ten files. A key has no dot (`app check` reads a dot as a path). Example from [`i18n/en-US.json`](../i18n/en-US.json):

```json
{ "title": "Camera", "errorTitle": "Camera unavailable", "imagens": "Pictures" }
```

### `paridade.json`

| Field               | Meaning                                                                                                                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `versao`            | always `1`                                                                                                                                                                                   |
| `app`               | the `id` (`camera`)                                                                                                                                                                          |
| `antes`             | where the app lived before the move                                                                                                                                                          |
| `auditoria`         | when and how the inventory was made (28/09/2026, line by line)                                                                                                                               |
| `funcionalidades[]` | one per feature: `o_que`, `estado` (`mantida`, `mudou` or `perdida`), `testes` (`test/<file> › <exact it() title>`), `evidencia`; `nota` is required for `mudou` and `decisao` for `perdida` |
