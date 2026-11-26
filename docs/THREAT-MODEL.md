# Threat model

_[Português](pt-BR/MODELO-DE-AMEACAS.md) | English_

> **For whom:** whoever reviews the Camera for security, or changes anything that touches the camera, the microphone, a capture or the CI.
> **What is here:** what it protects, from whom, the controls with the file that holds each one, and what it does not protect.
> **Where to go for the rest:** how to report a vulnerability, [SECURITY.md](../SECURITY.md); the architecture, [ARCHITECTURE.md](ARCHITECTURE.md#7-security-and-secrets).

## Table of contents

1. [What is protected](#1-what-is-protected)
2. [From whom](#2-from-whom)
3. [The controls](#3-the-controls)
4. [What is not protected](#4-what-is-not-protected)

## 1. What is protected

The live image and sound of the person's device, and the photos and videos they take. The Camera runs on the same origin as RoqueOS ([SECURITY.md](../SECURITY.md)), so its code has the same reach as RoqueOS's own code in that tab; that is why what enters this repository matters.

## 2. From whom

| Who                                   | What they would want                                                         |
| ------------------------------------- | ---------------------------------------------------------------------------- |
| An outside contributor's pull request | code that sends images out, keeps the camera on, or reads the person's files |
| A compromised or changed dependency   | the same, through `app-sdk`, `ui` or a dev dependency                        |
| A fork's pull request in CI           | a token with write access, or a secret                                       |
| Another site or app on the device     | the camera while the Camera is not in use                                    |

## 3. The controls

| Control                                                                                                                                                        | Where it lives                                                                                                                                                               |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The camera turns on only with the window open and off when it closes; the microphone only in video mode                                                        | `onUnmounted(cleanup)` and `audio: mode.value === 'video'` in [`src/useCamera.js`](../src/useCamera.js); test "fechar a janela desliga a câmera e solta o ouvinte do idioma" |
| The live image never leaves the device; a capture leaves only on Save (the person's Files), Download or Share                                                  | [`src/Camera.vue`](../src/Camera.vue): the only exits are `arquivos.salvar`, `<a download>` and `navigator.share`                                                            |
| No database, Storage or RoqueOS internal import                                                                                                                | `app check` sections "o app não fala com banco" and "o app não importa o RoqueOS"                                                                                            |
| Files only in the declared folder, without seeing paths or listing                                                                                             | `pastas: ["Imagens"]` in [`app.json`](../app.json); the system refuses others with `pasta-nao-declarada`; `app check` section "pastas declaradas"                            |
| Every merge reviewed by the maintainer                                                                                                                         | [`.github/CODEOWNERS`](../.github/CODEOWNERS)                                                                                                                                |
| Every commit signed off                                                                                                                                        | [`.github/workflows/dco.yml`](../.github/workflows/dco.yml)                                                                                                                  |
| CI on `pull_request`, never `pull_request_target`, read-only, no secret                                                                                        | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)                                                                                                                    |
| Exact versions: dependencies by tag, commits locked in `yarn.lock`, installed with `--frozen-lockfile --ignore-scripts`; RoqueOS installs the app by exact tag | [`package.json`](../package.json), [`yarn.lock`](../yarn.lock)                                                                                                               |
| No install-time script in the repository                                                                                                                       | `app check` section "scripts de instalação"                                                                                                                                  |
| Private vulnerability reporting, answer within seven days                                                                                                      | [SECURITY.md](../SECURITY.md)                                                                                                                                                |

## 4. What is not protected

- Same origin: a malicious change that passes review runs with RoqueOS's reach in the tab. The controls above are review, gate and pinning, not isolation.
- The browser's camera permission is per site, granted to the RoqueOS origin, not to this app; the browser does not distinguish the Camera from the rest of RoqueOS.
- What happens to a capture after Save, Download or Share is up to RoqueOS's Files, the device and the app chosen in the share sheet.
- The `blob:` URL of a video lives until retake or close; the data URL of the last photo stays in memory for the gallery chip while the window is open.
- No automated test runs against a real camera; the "camera off on close" guarantee is proven on fakes ([TESTING.md](TESTING.md#5-what-no-test-proves)).
