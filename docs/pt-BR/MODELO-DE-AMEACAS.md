# Modelo de ameaças

_Português | [English](../THREAT-MODEL.md)_

> **Para quem:** quem revisa a Câmera do ponto de vista de segurança, ou muda qualquer coisa que toque a câmera, o microfone, uma captura ou o CI.
> **O que tem aqui:** o que ela protege, de quem, os controles com o arquivo que sustenta cada um, e o que ela não protege.
> **Onde ir para o resto:** como relatar uma vulnerabilidade, [SECURITY.md](../../SECURITY.md); a arquitetura, [ARQUITETURA.md](ARQUITETURA.md#7-segurança-e-segredos).

## Sumário

1. [O que é protegido](#1-o-que-é-protegido)
2. [De quem](#2-de-quem)
3. [Os controles](#3-os-controles)
4. [O que não é protegido](#4-o-que-não-é-protegido)

## 1. O que é protegido

A imagem e o som ao vivo do aparelho da pessoa, e as fotos e os vídeos que ela tira. A Câmera roda na mesma origem do RoqueOS ([SECURITY.md](../../SECURITY.md)), então o código dela tem o mesmo alcance do código do próprio RoqueOS naquela aba; é por isso que o que entra neste repositório importa.

## 2. De quem

| Quem                                      | O que ia querer                                                                        |
| ----------------------------------------- | -------------------------------------------------------------------------------------- |
| Um pull request de quem contribui de fora | código que manda imagem para fora, mantém a câmera ligada, ou lê os arquivos da pessoa |
| Uma dependência comprometida ou alterada  | o mesmo, pelo `app-sdk`, pelo `ui` ou por uma dependência de desenvolvimento           |
| O pull request de um fork no CI           | um token com escrita, ou um segredo                                                    |
| Outro site ou app no aparelho             | a câmera enquanto a Câmera não está em uso                                             |

## 3. Os controles

| Controle                                                                                                                                                          | Onde mora                                                                                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A câmera só liga com a janela aberta e desliga quando ela fecha; o microfone só no modo vídeo                                                                     | `onUnmounted(cleanup)` e `audio: mode.value === 'video'` no [`src/useCamera.js`](../../src/useCamera.js); teste "fechar a janela desliga a câmera e solta o ouvinte do idioma" |
| A imagem ao vivo nunca sai do aparelho; a captura só sai em Salvar (os Arquivos da pessoa), Baixar ou Compartilhar                                                | [`src/Camera.vue`](../../src/Camera.vue): as únicas saídas são `arquivos.salvar`, `<a download>` e `navigator.share`                                                           |
| Sem banco, sem Storage, sem import de dentro do RoqueOS                                                                                                           | as seções "o app não fala com banco" e "o app não importa o RoqueOS" do `app check`                                                                                            |
| Arquivos só na pasta declarada, sem ver caminho nem listar                                                                                                        | `pastas: ["Imagens"]` no [`app.json`](../../app.json); o sistema recusa as outras com `pasta-nao-declarada`; a seção "pastas declaradas" do `app check`                        |
| Todo merge revisado pelo mantenedor                                                                                                                               | [`.github/CODEOWNERS`](../../.github/CODEOWNERS)                                                                                                                               |
| Todo commit com sign-off                                                                                                                                          | [`.github/workflows/dco.yml`](../../.github/workflows/dco.yml)                                                                                                                 |
| CI em `pull_request`, nunca `pull_request_target`, só leitura, sem segredo                                                                                        | [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)                                                                                                                   |
| Versões exatas: dependências por tag, commits travados no `yarn.lock`, instaladas com `--frozen-lockfile --ignore-scripts`; o RoqueOS instala o app por tag exata | [`package.json`](../../package.json), [`yarn.lock`](../../yarn.lock)                                                                                                           |
| Nenhum script de instalação no repositório                                                                                                                        | a seção "scripts de instalação" do `app check`                                                                                                                                 |
| Relato privado de vulnerabilidade, resposta em até sete dias                                                                                                      | [SECURITY.md](../../SECURITY.md)                                                                                                                                               |

## 4. O que não é protegido

- Mesma origem: uma mudança maliciosa que passe pela revisão roda com o alcance do RoqueOS na aba. Os controles acima são revisão, gate e pino, não isolamento.
- A permissão de câmera do navegador é por site, dada à origem do RoqueOS, não a este app; o navegador não distingue a Câmera do resto do RoqueOS.
- O que acontece com uma captura depois de Salvar, Baixar ou Compartilhar fica por conta dos Arquivos do RoqueOS, do aparelho e do app escolhido no compartilhar.
- A URL `blob:` de um vídeo vive até descartar ou fechar; a URL de dados da última foto fica na memória para a miniatura da galeria enquanto a janela está aberta.
- Nenhum teste automático roda contra uma câmera de verdade; a garantia de "câmera desligada ao fechar" é provada em imitações ([TESTES.md](TESTES.md#5-o-que-nenhum-teste-prova)).
