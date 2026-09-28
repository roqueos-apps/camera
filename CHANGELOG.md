# Changelog

O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/), e o projeto
usa [versionamento semântico](https://semver.org/lang/pt-BR/).

## [0.1.1] - sem data até o RoqueOS instalar

A auditoria de paridade de 28/09/2026 (Goal 28): o founder pediu que nenhuma funcionalidade
se perdesse na saída do núcleo.

### Adicionado

- `paridade.json`: o inventário do que a Câmera fazia dentro do RoqueOS, item por item, e o que
  aconteceu com cada coisa na saída (48 itens: 41 mantidas, 7 mudaram, 0 perdidas). Cada item
  cita o teste deste repo que o prova, ou a evidência, e o RoqueOS confere o arquivo no pacote
  instalado: teste citado que não existe mais, estado de dúvida ou perda sem decisão escrita
  reprovam. O arquivo vai no pacote (`files`).

### Corrigido

- **No app do iPhone, o disparador volta a ficar acima da barra de gestos**: a margem de baixo
  volta a usar a `--safe-area-inset-bottom` que o RoqueOS congela, com o `env()` só de
  reserva, como a Câmera fazia antes da saída.

### Mudado

- Iniciando, o visor mostra a barra do carregando que corre (o carregador de antes), parada no
  perfil leve; a folha de ajustes fecha também arrastando a alça (kit `ui` 0.6.0).

## [0.1.0] - sem data até o RoqueOS instalar

A Câmera sai do RoqueOS para o próprio repositório, falando com ele pelo `app-sdk` 0.3.0 e
desenhada com o kit `ui` 0.4.0. Para quem usa, as fotos e os vídeos continuam indo para as
Imagens, com o mesmo nome de arquivo. A `v0.1.0` pina o SDK num commit do PR #5 do
`app-sdk`; quando a 0.3.0 tiver a tag dela na `main`, sai a 0.1.1 pinada nela, e é essa
que ganha data.

### Mudado

- A câmera que não abre por outro motivo que não a permissão (ocupada por outro app, ou
  nenhuma câmera) mostra "Câmera indisponível" com "Tentar novamente". Antes o visor ficava
  preto e mudo: a tela só mostrava o estado com um erro que o motor nunca preenchia.
- Sem conta, salvar avisa que é preciso entrar, e a captura fica na tela para baixar ou
  compartilhar. Antes a Câmera tentava gravar como `guest`.
- O botão da galeria se chama Imagens, o nome da pasta que ele abre, para o leitor de tela e
  para quem passa o mouse. Antes ele se chamava "Câmera".
- As opções dos ajustes (temporizador, proporção, resolução, grade) e o modo foto ou vídeo
  dizem qual está escolhida para o leitor de tela (`aria-pressed`), e os interruptores do
  espelho e do nível têm o texto ao lado clicável.
- Os botões da barra, o disparador e as ações têm o foco visível no verde da Câmera.
- A janela estreita (e não só a tela pequena) esconde os rótulos do modo e encolhe o
  disparador: uma janela pequena na mesa também cabe.
- A descrição do app, que estava em inglês em oito idiomas, está traduzida nos dez.
