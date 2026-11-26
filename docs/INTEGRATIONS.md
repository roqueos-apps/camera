# Integrations

_[Português](pt-BR/INTEGRACOES.md) | English_

> **For whom:** whoever works on the RoqueOS side that installs and mounts the Camera, or on the `app-sdk`, and needs to know exactly what crosses the boundary.
> **What is here:** how RoqueOS installs the package, what it imports, the mount contract, every call the app makes to the `sistema`, the browser APIs it uses directly, and what may never change.
> **Where to go for the rest:** the flows in diagrams, [ARCHITECTURE.md](ARCHITECTURE.md#5-the-main-flows); the field formats, [REFERENCE.md](REFERENCE.md#formats).

## Table of contents

1. [How RoqueOS installs it](#1-how-roqueos-installs-it)
2. [The mount contract](#2-the-mount-contract)
3. [What the app asks of the system](#3-what-the-app-asks-of-the-system)
4. [What it takes straight from the browser](#4-what-it-takes-straight-from-the-browser)
5. [What never changes](#5-what-never-changes)

## 1. How RoqueOS installs it

RoqueOS lists the Camera as a git dependency pinned to a tag, and loads it lazily from its generated app loaders. On 18/11/2026 the RoqueOS front had:

```json
"@roqueos-apps/camera": "git+ssh://git@github.com/roqueos-apps/camera.git#v0.1.3"
```

and `ROSCamera: () => import('@roqueos-apps/camera')`. RoqueOS's own Vite compiles the app; [`vite.config.js`](../vite.config.js) here is only for `yarn dev` and `yarn test`. RoqueOS also reads `paridade.json` from the installed package ([TESTING.md](TESTING.md#4-parity-tests-that-roqueos-reads)), and its architecture test `apps-fora-do-nucleo` records the Camera as moved out on 2026-09-28, from `src/components/roqueos/apps/ROSCamera.vue`, `src/components/roqueos/apps/camera/` and `src/composables/useCamera.js`.

## 2. The mount contract

The package entry is the default export of [`src/index.js`](../src/index.js):

| Member                                    | Value                                          | Meaning                                                                          |
| ----------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------- |
| `id`                                      | `camera`                                       | the same as `app.json`                                                           |
| `versaoDoContrato`                        | the SDK's contract version (`1` in `app.json`) | set by `definirApp`                                                              |
| `capacidades`                             | `['arquivos']`                                 | checked by `verificarSistema` before mounting                                    |
| `mount(el, sistema, { windowId, ativo })` | returns `{ ativar(sim), desmontar() }`         | `ativar` follows window focus; `desmontar` unmounts Vue and turns the camera off |

`mount` throws `[camera] o sistema não cumpre o contrato: ...` if the system lacks `arquivos`. The app creates its own Vue app inside `el`: no store, plugin or global style of RoqueOS reaches it.

## 3. What the app asks of the system

| Call                                                                  | When                                                            | Answer the app handles                                                                             |
| --------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `sistema.idioma.atual()`, `sistema.idioma.aoMudar(fn)`                | at mount, and on every language change while the window is open | the stop function is called on `desmontar`                                                         |
| `sistema.desempenho.modoLeve()`                                       | once, at mount                                                  | `true` turns on the light look                                                                     |
| `sistema.arquivos.salvar({ nome, conteudo, tipo, pasta: 'Imagens' })` | Save                                                            | success: notice and back to the live image; `sem-conta`: notice, capture kept; other: error notice |
| `sistema.arquivos.abrirPasta('Imagens')`                              | the gallery button                                              | `sem-conta`: notice; other: logged as `[camera] abrir as Imagens`                                  |
| `sistema.avisar(texto, { tipo, titulo })`                             | after Download, Save and on errors                              | none                                                                                               |
| `sistema.metricas.evento('photo_capture')`                            | once per photo actually drawn                                   | none                                                                                               |

## 4. What it takes straight from the browser

`navigator.mediaDevices.getUserMedia` and `enumerateDevices`, `MediaStreamTrack.getCapabilities`, `getSettings` and `applyConstraints` (zoom, torch), `MediaRecorder`, canvas `toDataURL`, `DeviceOrientationEvent` (and `requestPermission` on iOS), `navigator.share` with files, and an `<a download>` for Download ([`src/useCamera.js`](../src/useCamera.js), [`src/Camera.vue`](../src/Camera.vue)). The SDK has no `camera` capability, because the system mediates nothing there.

## 5. What never changes

| Name                                  | Why                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------- |
| `id` `camera`                         | RoqueOS finds the window, the shortcut and its place in Big Picture by it |
| `RoqueOS_Photo_` and `RoqueOS_Video_` | a new prefix splits new captures from old ones in Pictures                |
| `photo_capture`                       | the metric history depends on it                                          |
| `Imagens`                             | the folder people already have their captures in                          |
