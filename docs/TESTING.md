# Testing

_[Português](pt-BR/TESTES.md) | English_

> **For whom:** whoever changes the Camera and needs to know which test covers what, and what the gate accepts.
> **What is here:** the acceptance criterion, what each suite proves, how the browser is faked, how `paridade.json` ties the tests to RoqueOS, and what no test proves.
> **Where to go for the rest:** when a test fails, [WHEN-IT-BREAKS.md](WHEN-IT-BREAKS.md#the-gate); the commands, [REFERENCE.md](REFERENCE.md#commands).

## Table of contents

1. [The acceptance criterion](#1-the-acceptance-criterion)
2. [The suites](#2-the-suites)
3. [How the browser is faked](#3-how-the-browser-is-faked)
4. [Parity: tests that RoqueOS reads](#4-parity-tests-that-roqueos-reads)
5. [What no test proves](#5-what-no-test-proves)

## 1. The acceptance criterion

A change is accepted when `yarn verificar` passes, which is what CI and the `pre-push` run:

```bash
yarn verificar
```

It runs, in order and stopping at the first failure: `eslint .`, `prettier --check .`, `vitest run` and `app check`. Measured on 18/11/2026: 4 files, 47 tests, every `app check` section `ok`. Every fix comes with a test that fails without it, and a new check passes a mutation test ([CLAUDE.md](../CLAUDE.md)). A visible change also needs the app opened for real in `yarn dev`, with a screenshot ([`.claude/loop.md`](../.claude/loop.md)).

## 2. The suites

| Suite                                                 | What it proves                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Tests on 18/11/2026 |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| [`test/app.spec.js`](../test/app.spec.js)             | the app as the SDK sees it, mounted with the SDK's fake system and the real engine: id and capabilities equal to the manifest, rear camera and the buttons the device supports, loading, denied and unavailable states, language switch with the window open, photo saved to Pictures with the permanent name and the metric, no-account refusal, the gallery opening Pictures, the timer, video with microphone saved as webm, discard, light profile, and closing the window turning the camera off | 16                  |
| [`test/useCamera.spec.js`](../test/useCamera.spec.js) | the engine alone: stream start, capability probing, one or no camera is not "several cameras", CSS zoom cropping the centre, the zoom range the device declares, denied permission, switching camera and resolution, mirrored capture, native and CSS zoom, torch, video Blob, retake revoking the `blob:` URL, the metric once per photo, tracks stopped on unmount                                                                                                                                  | 18                  |
| [`test/textos.spec.js`](../test/textos.spec.js)       | every `t('key')` of the screen and every value of `ROTULO_DA_GRADE` exists, non-empty, in each of the ten languages, and no language keeps a key the screen does not ask for; there is one JSON per language and only ten                                                                                                                                                                                                                                                                             | 12                  |
| [`test/estilo.spec.js`](../test/estilo.spec.js)       | every `env(safe-area-inset-bottom)` in `camera.scss` is a fallback inside `var(--safe-area-inset-bottom, ...)`                                                                                                                                                                                                                                                                                                                                                                                        | 1                   |

The engine suite came from RoqueOS (`tests/unit/composables/useCamera.spec.js`) without changes to its cases; only the metric is new ([`test/useCamera.spec.js`](../test/useCamera.spec.js)).

## 3. How the browser is faked

Vitest runs on jsdom ([`vite.config.js`](../vite.config.js)). [`test/preparar.js`](../test/preparar.js) supplies an empty `ResizeObserver` and `matchMedia`, and unmounts every component at the end of each test. [`test/app.spec.js`](../test/app.spec.js) defines `navigator.mediaDevices` with two cameras and a track with `torch`, and mocks `play`, a 640x360 frame, the canvas context, `toDataURL`, `fetch` returning a Blob, and `URL.createObjectURL`. The fake system records what the app did (`avisos`, `eventos`, `arquivos`), and the tests read that record.

## 4. Parity: tests that RoqueOS reads

Every item of [`paridade.json`](../paridade.json) cites tests as `test/<file> › <exact title of the it()>`. RoqueOS checks, in the installed package, that each cited file and title still exist. Renaming a test cited there breaks RoqueOS's check: change the citation in the same commit. Run the check from a RoqueOS checkout next to this repository:

```bash
node scripts/paridade-dos-apps.mjs ../camera
```

## 5. What no test proves

- Behaviour on a real camera, real `MediaRecorder` and real `DeviceOrientation`: all faked. Checked by hand in `yarn dev` and inside RoqueOS.
- The 720p default (`paridade.json`, first item, says so).
- The layout: the compact `@container` rule and the visual look are not asserted by any test, except the safe-area rule.
- The documentation: `roqueos-docs` is not part of `yarn verificar`.
