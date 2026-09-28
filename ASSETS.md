# Origem dos assets

Todo arquivo em `public/` tem uma linha aqui, com a licença e a origem. O `app check` reprova
arquivo sem linha e licença fora da lista do SDK.

A Câmera não tem `public/`: não usa imagem, som nem fonte de arquivo. O clique do disparador é
visual (o flash branco), sem som.

Os ícones da tela vêm do kit de interface (`@roqueos-apps/ui`), que leva os traços do
[Material Icons](https://fonts.google.com/icons) do Google, sob Apache-2.0; a origem está no
ASSETS.md do kit. O ícone da janela e da Launchpad é o `photo_camera` do Material Icons,
desenhado pelo RoqueOS a partir do nome no `app.json`.

A capa do README (`docs/capa.jpg`) é um print do app dentro do RoqueOS (build 2579 do front, em
pt-BR), tirado com o Playwright numa sessão de teste com a câmera falsa do Chromium, alimentada por
um degradê gerado para o print, em 28/09/2026; autoral, MIT como o resto do repo. Ela não vai no
pacote que o RoqueOS instala (o `files` do `package.json` não leva `docs/`).
