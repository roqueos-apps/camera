# Operations

_[Português](pt-BR/OPERACAO.md) | English_

> **For whom:** the maintainer, and whoever cuts a release or keeps the repository healthy.
> **What is here:** what runs and where, the maintenance routine, how a version reaches RoqueOS, updating dependencies without breaking, undoing a release, where the data is, and what to watch.
> **Where to go for the rest:** when something fails, [WHEN-IT-BREAKS.md](WHEN-IT-BREAKS.md); the commands, [REFERENCE.md](REFERENCE.md); the contract with RoqueOS, [INTEGRATIONS.md](INTEGRATIONS.md).

## Table of contents

1. [What runs and where](#1-what-runs-and-where)
2. [The maintenance routine](#2-the-maintenance-routine)
3. [Cutting a release](#3-cutting-a-release)
4. [Updating without breaking](#4-updating-without-breaking)
5. [Undoing](#5-undoing)
6. [Data and backup](#6-data-and-backup)
7. [What to watch](#7-what-to-watch)

## 1. What runs and where

Nothing of this repository runs on a schedule, and there is no server. The app runs inside RoqueOS, in the browser of whoever uses it. What runs here is the gate: on your machine (`yarn verificar`, also the `pre-push`) and on GitHub Actions on every push to `main` and every pull request, forks included ([`.github/workflows/ci.yml`](../.github/workflows/ci.yml)), plus the `dco` workflow on pull requests ([`.github/workflows/dco.yml`](../.github/workflows/dco.yml)). Neither workflow reads a secret, and both have read-only permission.

## 2. The maintenance routine

The routine is written for agents in [`.claude/loop.md`](../.claude/loop.md), one item per pass, stopping at the first with work:

1. Local gate red: fix it and paste the output.
2. GitHub CI red: `gh run list --limit 3`. Red there and green here is a divergent environment, investigated before anything else.
3. Pull request without `Signed-off-by`: answer with the fix command, `git rebase --signoff main`.
4. Outside issue or pull request without an answer: `gh issue list`, `gh pr list`.
5. Asset without origin in `ASSETS.md`.
6. SDK behind: a new `app-sdk` tag with a capability this app uses becomes a bump.
7. Docs drift: README, CONTRIBUTING and `app.json` say the same thing about what the app does, its capabilities and languages.

```bash
yarn verificar
gh run list --limit 3
gh issue list
gh pr list
```

A visible change is not done until the app was opened for real (`yarn dev`, in the fake window) with a screenshot, and inside RoqueOS when the change reaches it ([`.claude/loop.md`](../.claude/loop.md)).

## 3. Cutting a release

A version is a git tag. RoqueOS pins the Camera by exact tag in its own `package.json` (on 18/11/2026: `"@roqueos-apps/camera": "git+ssh://git@github.com/roqueos-apps/camera.git#v0.1.3"`), so nothing reaches people until RoqueOS moves its pin. The existing tags are `v0.1.0` to `v0.1.3`, annotated.

```bash
# the release commit ("version" in package.json, [Não lançado] moved to a dated section of
# CHANGELOG.md) already merged into main through a pull request
git switch main && git pull
yarn verificar
git tag -a v0.1.4 -m "v0.1.4"
git push origin v0.1.4
```

Then, in the RoqueOS repository, point the dependency at the new tag and run its checks: the architecture test `apps-fora-do-nucleo.spec.js` and the parity script, which reads `paridade.json` from the installed package and refuses a cited test that no longer exists or a loss without a written decision:

```bash
node scripts/paridade-dos-apps.mjs ../camera
```

The CHANGELOG records versions that were tagged but never installed: 0.1.0 and 0.1.1 pinned the SDK on a commit of `app-sdk` PR #5, and 0.1.2 was superseded by 0.1.3 after the QA of the build that would install it found the "Starting camera" text said twice ([CHANGELOG.md](../CHANGELOG.md)). A version gets its date when RoqueOS installs it.

## 4. Updating without breaking

| What                                                    | How                                                                                                                          | What proves it did not break                                                                                                                      |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@roqueos-apps/app-sdk`                                 | change the tag in `package.json` (`github:roqueos-apps/app-sdk#vX.Y.Z`), `yarn install --ignore-scripts`, commit `yarn.lock` | `yarn verificar` (the screen runs on the SDK's fake system, and `app check` comes from the new version), and a CHANGELOG line saying what changed |
| `@roqueos-apps/ui`                                      | the same, with `github:roqueos-apps/ui#vX.Y.Z`; always HTTPS, never `git+ssh`                                                | `yarn verificar`, and the app opened in `yarn dev` because the primitives are visual                                                              |
| Dev dependencies (Vite, Vitest, ESLint, Prettier, Sass) | pinned to exact versions; bump one at a time                                                                                 | `yarn verificar`                                                                                                                                  |
| A feature, or a test cited in `paridade.json`           | update the inventory in the same commit                                                                                      | the parity script in RoqueOS                                                                                                                      |

Never weaken a test to make the gate pass ([`.claude/loop.md`](../.claude/loop.md)).

## 5. Undoing

| Step                                    | The way back                                                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| A tag that RoqueOS installed and is bad | RoqueOS points its dependency back to the previous tag; the old tags stay on GitHub                          |
| A tag that RoqueOS has not installed    | do not install it; cut the next version with the fix, as 0.1.3 did for 0.1.2                                 |
| A merged commit on `main`               | `git revert -s <commit>` on a branch, through a pull request                                                 |
| A bad `yarn.lock`                       | `git checkout origin/main -- yarn.lock package.json`, then `yarn install --frozen-lockfile --ignore-scripts` |

## 6. Data and backup

The repository keeps no data of anyone. Photos and videos live in the person's Files, in the Pictures folder, owned and stored by RoqueOS; the Camera only calls `sistema.arquivos.salvar` and never reads them back. Backup of the repository is GitHub itself. In `yarn dev` the saved files are in memory and disappear on F5.

## 7. What to watch

| What                  | Where                                                              | Healthy                                                                                    |
| --------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| The gate              | `yarn verificar`                                                   | every section `ok`; on 18/11/2026, 47 tests in 4 files and `ok, o repo cumpre o contrato.` |
| CI                    | `gh run list --limit 3`                                            | `verificar` green on `main`                                                                |
| Parity                | `node scripts/paridade-dos-apps.mjs ../camera` in RoqueOS          | on 18/11/2026: `paridade ok: 48 funcionalidades ({"mantida":41,"mudou":7,"perdida":0})`    |
| Outside contributions | `gh issue list`, `gh pr list`                                      | none waiting for an answer                                                                 |
| Error reports         | issues from the bug template, and the private vulnerability report | none open without an answer; security within seven days ([SECURITY.md](../SECURITY.md))    |
