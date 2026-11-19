# Documentação da Câmera

_Português | [English](../INDEX.md)_

A Câmera do RoqueOS, no próprio repositório aberto: fotos e vídeos com a câmera do aparelho, salvos nas Imagens dos Arquivos. Este é o mapa para quem contribui e para o mantenedor.

Por onde começar depende do que você quer.

| Quero...                                    | Leia                                                                                          |
| ------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **Instalar e ver funcionando**              | [COMECAR.md](COMECAR.md): do zero à Câmera numa janela falsa do RoqueOS                       |
| **Manter e soltar versão**                  | [OPERACAO.md](OPERACAO.md): rotina, versão, atualizar, desfazer, o que olhar                  |
| **Entender uma falha**                      | [QUANDO-QUEBRA.md](QUANDO-QUEBRA.md): sintoma, causa, o que fazer                             |
| **Ver como ela é por dentro**               | [ARQUITETURA.md](ARQUITETURA.md): contexto, processos, componentes, fluxos, decisões, limites |
| **Consultar um comando, arquivo ou chave**  | [REFERENCIA.md](REFERENCIA.md)                                                                |
| **Saber o que o RoqueOS e a Câmera trocam** | [INTEGRACOES.md](INTEGRACOES.md): instalação, montagem, cada chamada ao sistema               |
| **Saber que teste cobre o quê**             | [TESTES.md](TESTES.md): o gate, as suítes, a paridade                                         |
| **Saber o que ela protege**                 | [MODELO-DE-AMEACAS.md](MODELO-DE-AMEACAS.md)                                                  |
| **Achar um termo**                          | [GLOSSARIO.md](GLOSSARIO.md)                                                                  |
| **Contribuir**                              | [CONTRIBUTING.md](CONTRIBUTING.md)                                                            |
| **Ver o que mudou**                         | [CHANGELOG.md](../../CHANGELOG.md)                                                            |
| **Relatar uma vulnerabilidade**             | [SECURITY.md](../../SECURITY.md)                                                              |

## Diagramas

| Diagrama                                                 | Fonte                                                                            | Explicado em                                                     |
| -------------------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Contexto (a Câmera, o navegador, o RoqueOS, os Arquivos) | Mermaid em [ARQUITETURA.md](ARQUITETURA.md#2-contexto-quem-usa-e-do-que-depende) | a mesma seção                                                    |
| Abrir a janela                                           | Mermaid em [ARQUITETURA.md](ARQUITETURA.md#51-abrir-a-janela)                    | a mesma seção                                                    |
| Tirar e salvar uma foto                                  | Mermaid em [ARQUITETURA.md](ARQUITETURA.md#52-tirar-e-salvar-uma-foto)           | a mesma seção                                                    |
| Gravar um vídeo                                          | Mermaid em [ARQUITETURA.md](ARQUITETURA.md#53-gravar-um-vídeo)                   | a mesma seção                                                    |
| Fechar a janela                                          | Mermaid em [ARQUITETURA.md](ARQUITETURA.md#54-fechar-a-janela)                   | a mesma seção                                                    |
| A visão geral do README                                  | Mermaid no [README.pt-BR.md](../../README.pt-BR.md#arquitetura)                  | o README                                                         |
| A capa do README, `capa.jpg`                             | print do Playwright dentro do RoqueOS, 28/09/2026 ([ASSETS.md](../../ASSETS.md)) | [ARQUITETURA.md](ARQUITETURA.md#10-como-os-diagramas-são-feitos) |
