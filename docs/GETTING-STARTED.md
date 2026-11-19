# Getting started

_[Português](pt-BR/COMECAR.md) | English_

> **For whom:** someone who has never run the Camera and wants to see it working on their own machine, with their own camera.
> **What is here:** the prerequisites with the command that checks each one, install, the first visible result in a fake RoqueOS window, the gate, and the usual first-time errors.
> **Where to go for the rest:** how it works inside, [ARCHITECTURE.md](ARCHITECTURE.md); every command, [REFERENCE.md](REFERENCE.md); when something fails, [WHEN-IT-BREAKS.md](WHEN-IT-BREAKS.md).

## Table of contents

1. [What you need](#1-what-you-need)
2. [Download and install](#2-download-and-install)
3. [The first result](#3-the-first-result)
4. [Check that everything is right](#4-check-that-everything-is-right)
5. [Next steps](#5-next-steps)

## 1. What you need

| Tool                    | Version                                                                                                    | How to check                         | Where it comes from                                                      |
| ----------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------ |
| Node.js                 | 22 or newer (`engines` in [`package.json`](../package.json)); [`.nvmrc`](../.nvmrc) says 24, which CI uses | `node -v`                            | nodejs.org, or `nvm use` in the repo                                     |
| Yarn                    | 1.22 (`packageManager: yarn@1.22.22`)                                                                      | `yarn -v`                            | `corepack enable`, or the Yarn 1 installer                               |
| git                     | any recent                                                                                                 | `git --version`                      | your system                                                              |
| A browser with a camera | one that offers `getUserMedia`                                                                             | open `yarn dev` and allow the camera | your machine; without a camera the viewfinder shows "Camera unavailable" |

No account, key or secret is needed: `yarn dev` runs a local account with in-memory Files.

## 2. Download and install

```bash
git clone https://github.com/roqueos-apps/camera.git
cd camera
yarn install --ignore-scripts
```

`--ignore-scripts` keeps any dependency script from running at install time; the repository itself has none, and `app check` fails a repository that has one. CI installs with `yarn install --frozen-lockfile --ignore-scripts`, exactly the versions in `yarn.lock` ([`.github/workflows/ci.yml`](../.github/workflows/ci.yml)). Both dependencies of the SDK family come over HTTPS from GitHub tags (`app-sdk` `v0.3.0`, `ui` `v0.6.0`), so no SSH key is needed.

It worked when Yarn ends with `Done in`, and `node_modules/@roqueos-apps/app-sdk` and `node_modules/@roqueos-apps/ui` exist.

## 3. The first result

```bash
yarn dev
```

Vite prints a local address; open it. You see the Camera inside a fake RoqueOS window, sized from [`app.json`](../app.json), and the browser asks for the camera. Allow it, and the live image appears with the rule-of-thirds grid, the shutter and the Photo and Video switch. Take a photo, press Save, and the console shows the save notice; the file goes to in-memory Files and is gone on F5 ([`dev/main.js`](../dev/main.js)).

Try the query parameters: `?idioma=ar-AR` opens in Arabic (right to left), `?leve=1` as a weak device sees it (no animated mesh, no blur), `?convidado=1` without an account (Save refuses with "Sign in to save to Files.", Download still works). Narrow the window below 560 px and the mode labels disappear and the shutter shrinks.

## 4. Check that everything is right

```bash
yarn verificar
```

It runs lint, the Prettier check, the tests and `app check`, the same as CI and the `pre-push`. Measured on 18/11/2026 on this repository: 4 test files, 47 tests passed, and `app check` ending with:

```text
ok, o repo cumpre o contrato.
```

To run only the tests, `yarn test`. What each suite proves is in [TESTING.md](TESTING.md).

## 5. Next steps

- Change something: read [ARCHITECTURE.md](ARCHITECTURE.md) and then [CONTRIBUTING.md](../CONTRIBUTING.md) (every commit with `git commit -s`).
- Look up a command, a file or a key: [REFERENCE.md](REFERENCE.md).
- Cut a release or update the SDK: [OPERATIONS.md](OPERATIONS.md).

## When something does not work

The usual first-time failures: `Permission denied (publickey)` during install (an old lockfile or branch still pinning a dependency over `git+ssh`), the viewfinder showing "Camera access denied" (the browser refused the camera; allow it in the site settings and press Retry), "Camera unavailable" (another program holds the camera, or there is none), and `yarn verificar` failing on Prettier after you edited a Markdown file (`yarn format`). Each one, with the literal message and the fix, is in [WHEN-IT-BREAKS.md](WHEN-IT-BREAKS.md).
