# Operação

_Português | [English](../OPERATIONS.md)_

> **Para quem:** o mantenedor, e quem solta uma versão ou mantém o repositório saudável.
> **O que tem aqui:** o que roda e onde, a rotina de manutenção, como uma versão chega ao RoqueOS, atualizar dependências sem quebrar, desfazer uma versão, onde estão os dados e o que olhar.
> **Onde ir para o resto:** quando algo falha, [QUANDO-QUEBRA.md](QUANDO-QUEBRA.md); os comandos, [REFERENCIA.md](REFERENCIA.md); o contrato com o RoqueOS, [INTEGRACOES.md](INTEGRACOES.md).

## Sumário

1. [O que roda e onde](#1-o-que-roda-e-onde)
2. [A rotina de manutenção](#2-a-rotina-de-manutenção)
3. [Soltar uma versão](#3-soltar-uma-versão)
4. [Atualizar sem quebrar](#4-atualizar-sem-quebrar)
5. [Desfazer](#5-desfazer)
6. [Dados e backup](#6-dados-e-backup)
7. [O que olhar](#7-o-que-olhar)

## 1. O que roda e onde

Nada deste repositório roda em horário marcado, e não há servidor. O app roda dentro do RoqueOS, no navegador de quem usa. O que roda aqui é o gate: na sua máquina (`yarn verificar`, também o `pre-push`) e no GitHub Actions a cada push na `main` e a cada pull request, de fork inclusive ([`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)), mais o workflow `dco` nos pull requests ([`.github/workflows/dco.yml`](../../.github/workflows/dco.yml)). Nenhum dos dois lê segredo, e os dois têm permissão só de leitura.

## 2. A rotina de manutenção

A rotina está escrita para agentes no [`.claude/loop.md`](../../.claude/loop.md), uma coisa por passada, parando na primeira que tiver trabalho:

1. Gate local vermelho: conserta e cola a saída.
2. CI do GitHub vermelho: `gh run list --limit 3`. Vermelho lá e verde aqui é ambiente divergente, e se investiga antes de qualquer outra coisa.
3. Pull request sem `Signed-off-by`: responde com o comando que conserta, `git rebase --signoff main`.
4. Issue ou pull request de fora sem resposta: `gh issue list`, `gh pr list`.
5. Asset sem origem no `ASSETS.md`.
6. SDK atrás: tag nova do `app-sdk` com capacidade que este app usa vira bump.
7. Deriva de docs: README, CONTRIBUTING e `app.json` dizem a mesma coisa sobre o que o app faz, as capacidades e os idiomas.

```bash
yarn verificar
gh run list --limit 3
gh issue list
gh pr list
```

Mudança visível não fecha sem o app aberto de verdade (`yarn dev`, na janela falsa) com print, e no RoqueOS quando a mudança chega lá ([`.claude/loop.md`](../../.claude/loop.md)).

## 3. Soltar uma versão

Uma versão é uma tag git. O RoqueOS pina a Câmera por tag exata no próprio `package.json` (em 18/11/2026: `"@roqueos-apps/camera": "git+ssh://git@github.com/roqueos-apps/camera.git#v0.1.3"`), então nada chega às pessoas até o RoqueOS mudar o pino. As tags que existem são de `v0.1.0` a `v0.1.3`, anotadas.

```bash
# the release commit ("version" in package.json, [Não lançado] moved to a dated section of
# CHANGELOG.md) already merged into main through a pull request
git switch main && git pull
yarn verificar
git tag -a v0.1.4 -m "v0.1.4"
git push origin v0.1.4
```

Depois, no repositório do RoqueOS, aponte a dependência para a tag nova e rode as conferências dele: o teste de arquitetura `apps-fora-do-nucleo.spec.js` e o script de paridade, que lê o `paridade.json` do pacote instalado e recusa teste citado que não existe mais ou perda sem decisão escrita:

```bash
node scripts/paridade-dos-apps.mjs ../camera
```

O CHANGELOG registra versões tagueadas e nunca instaladas: a 0.1.0 e a 0.1.1 pinavam o SDK num commit do PR #5 do `app-sdk`, e a 0.1.2 foi trocada pela 0.1.3 depois que o QA do build que ia instalá-la achou o "Iniciando câmera" dito duas vezes ([CHANGELOG.md](../../CHANGELOG.md)). Uma versão ganha data quando o RoqueOS a instala.

## 4. Atualizar sem quebrar

| O quê                                                                  | Como                                                                                                                               | O que prova que não quebrou                                                                                                              |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `@roqueos-apps/app-sdk`                                                | troque a tag no `package.json` (`github:roqueos-apps/app-sdk#vX.Y.Z`), `yarn install --ignore-scripts`, faça commit do `yarn.lock` | `yarn verificar` (a tela roda no sistema falso do SDK, e o `app check` vem da versão nova), e uma linha no CHANGELOG dizendo o que mudou |
| `@roqueos-apps/ui`                                                     | o mesmo, com `github:roqueos-apps/ui#vX.Y.Z`; sempre HTTPS, nunca `git+ssh`                                                        | `yarn verificar`, e o app aberto no `yarn dev`, porque os primitivos são visuais                                                         |
| Dependências de desenvolvimento (Vite, Vitest, ESLint, Prettier, Sass) | pinadas em versão exata; suba uma de cada vez                                                                                      | `yarn verificar`                                                                                                                         |
| Uma funcionalidade, ou um teste citado no `paridade.json`              | atualize o inventário no mesmo commit                                                                                              | o script de paridade no RoqueOS                                                                                                          |

Nunca enfraqueça teste para o gate passar ([`.claude/loop.md`](../../.claude/loop.md)).

## 5. Desfazer

| Passo                                      | O caminho de volta                                                                                             |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Uma tag que o RoqueOS instalou e está ruim | o RoqueOS aponta a dependência de volta para a tag anterior; as tags antigas continuam no GitHub               |
| Uma tag que o RoqueOS não instalou         | não instale; solte a próxima versão com o conserto, como a 0.1.3 fez com a 0.1.2                               |
| Um commit já na `main`                     | `git revert -s <commit>` num branch, por pull request                                                          |
| Um `yarn.lock` ruim                        | `git checkout origin/main -- yarn.lock package.json`, depois `yarn install --frozen-lockfile --ignore-scripts` |

## 6. Dados e backup

O repositório não guarda dado de ninguém. As fotos e os vídeos moram nos Arquivos da pessoa, na pasta Imagens, que o RoqueOS guarda e é dono; a Câmera só chama `sistema.arquivos.salvar` e nunca lê de volta. O backup do repositório é o próprio GitHub. No `yarn dev` os arquivos salvos ficam em memória e somem no F5.

## 7. O que olhar

| O quê                 | Onde                                                              | Saudável                                                                                  |
| --------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| O gate                | `yarn verificar`                                                  | toda seção `ok`; em 18/11/2026, 47 testes em 4 arquivos e `ok, o repo cumpre o contrato.` |
| CI                    | `gh run list --limit 3`                                           | `verificar` verde na `main`                                                               |
| Paridade              | `node scripts/paridade-dos-apps.mjs ../camera` no RoqueOS         | em 18/11/2026: `paridade ok: 48 funcionalidades ({"mantida":41,"mudou":7,"perdida":0})`   |
| Contribuições de fora | `gh issue list`, `gh pr list`                                     | nenhuma esperando resposta                                                                |
| Relatos de erro       | issues do modelo de bug, e o relatório privado de vulnerabilidade | nenhum aberto sem resposta; segurança em até sete dias ([SECURITY.md](../../SECURITY.md)) |
