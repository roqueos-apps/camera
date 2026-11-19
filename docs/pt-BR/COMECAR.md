# Começar

_Português | [English](../GETTING-STARTED.md)_

> **Para quem:** quem nunca rodou a Câmera e quer vê-la funcionando na própria máquina, com a própria câmera.
> **O que tem aqui:** os pré-requisitos com o comando que confere cada um, a instalação, o primeiro resultado visível numa janela falsa do RoqueOS, o gate e os erros comuns de primeira vez.
> **Onde ir para o resto:** como funciona por dentro, [ARQUITETURA.md](ARQUITETURA.md); todo comando, [REFERENCIA.md](REFERENCIA.md); quando algo falha, [QUANDO-QUEBRA.md](QUANDO-QUEBRA.md).

## Sumário

1. [O que você precisa](#1-o-que-você-precisa)
2. [Baixar e instalar](#2-baixar-e-instalar)
3. [O primeiro resultado](#3-o-primeiro-resultado)
4. [Conferir que está tudo certo](#4-conferir-que-está-tudo-certo)
5. [Próximos passos](#5-próximos-passos)

## 1. O que você precisa

| Ferramenta              | Versão                                                                                                                       | Como conferir                       | De onde vem                                                    |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------- |
| Node.js                 | 22 ou mais novo (`engines` do [`package.json`](../../package.json)); o [`.nvmrc`](../../.nvmrc) diz 24, que é o que o CI usa | `node -v`                           | nodejs.org, ou `nvm use` no repo                               |
| Yarn                    | 1.22 (`packageManager: yarn@1.22.22`)                                                                                        | `yarn -v`                           | `corepack enable`, ou o instalador do Yarn 1                   |
| git                     | qualquer recente                                                                                                             | `git --version`                     | o seu sistema                                                  |
| Um navegador com câmera | um que ofereça `getUserMedia`                                                                                                | abra o `yarn dev` e libere a câmera | a sua máquina; sem câmera o visor mostra "Câmera indisponível" |

Não precisa de conta, chave nem segredo: o `yarn dev` roda numa conta local com Arquivos em memória.

## 2. Baixar e instalar

```bash
git clone https://github.com/roqueos-apps/camera.git
cd camera
yarn install --ignore-scripts
```

O `--ignore-scripts` impede que script de dependência rode na instalação; o repositório não tem nenhum, e o `app check` reprova o que tiver. O CI instala com `yarn install --frozen-lockfile --ignore-scripts`, exatamente as versões do `yarn.lock` ([`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)). As duas dependências da família do SDK vêm por HTTPS de tags do GitHub (`app-sdk` `v0.3.0`, `ui` `v0.6.0`), então não precisa de chave SSH.

Deu certo quando o Yarn termina com `Done in`, e `node_modules/@roqueos-apps/app-sdk` e `node_modules/@roqueos-apps/ui` existem.

## 3. O primeiro resultado

```bash
yarn dev
```

O Vite imprime um endereço local; abra. Você vê a Câmera dentro de uma janela falsa do RoqueOS, no tamanho do [`app.json`](../../app.json), e o navegador pede a câmera. Libere, e a imagem ao vivo aparece com a grade de terços, o disparador e a troca entre Foto e Vídeo. Tire uma foto, aperte Salvar, e o console mostra o aviso de salvo; o arquivo vai para Arquivos em memória e some no F5 ([`dev/main.js`](../../dev/main.js)).

Experimente os parâmetros da URL: `?idioma=ar-AR` abre em árabe (da direita para a esquerda), `?leve=1` como o aparelho fraco vê (sem a malha animada, sem desfoque), `?convidado=1` sem conta (Salvar recusa com "Entre na sua conta para salvar em Arquivos.", Baixar continua). Estreite a janela abaixo de 560 px e os rótulos do modo somem e o disparador encolhe.

## 4. Conferir que está tudo certo

```bash
yarn verificar
```

Roda lint, a conferência do Prettier, os testes e o `app check`, o mesmo do CI e do `pre-push`. Medido em 18/11/2026 neste repositório: 4 arquivos de teste, 47 testes passando, e o `app check` terminando com:

```text
ok, o repo cumpre o contrato.
```

Para rodar só os testes, `yarn test`. O que cada suíte prova está em [TESTES.md](TESTES.md).

## 5. Próximos passos

- Mudar alguma coisa: leia a [ARQUITETURA.md](ARQUITETURA.md) e depois o [guia de contribuição](CONTRIBUTING.md) (todo commit com `git commit -s`).
- Consultar um comando, um arquivo ou uma chave: [REFERENCIA.md](REFERENCIA.md).
- Soltar uma versão ou atualizar o SDK: [OPERACAO.md](OPERACAO.md).

## Quando algo não funciona

As falhas comuns de primeira vez: `Permission denied (publickey)` na instalação (um lockfile ou branch antigo ainda pinando uma dependência por `git+ssh`), o visor mostrando "Acesso à câmera negado" (o navegador recusou a câmera; libere nas configurações do site e aperte Tentar novamente), "Câmera indisponível" (outro programa está com a câmera, ou não há câmera), e o `yarn verificar` reprovando no Prettier depois de você editar um Markdown (`yarn format`). Cada uma, com a mensagem literal e o conserto, está em [QUANDO-QUEBRA.md](QUANDO-QUEBRA.md).
