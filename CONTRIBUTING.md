# Como contribuir

Obrigado por querer ajudar. A régua comum da organização está no
[CONTRIBUTING da roqueos-apps](https://github.com/roqueos-apps/.github/blob/main/CONTRIBUTING.md);
aqui entra só o que é da Câmera.

1. Abra uma issue antes de mudar o que a pessoa vê ou o que a Câmera salva. Correção pequena
   pode ir direto para o PR.
2. Faça o fork, crie um branch e rode `yarn install --ignore-scripts`.
3. Todo commit leva `Signed-off-by` (`git commit -s`, o DCO). O check `dco` do pull request
   reprova sem.
4. Toda correção vem com um teste que reprova sem ela. O motor (stream, recorte, zoom, vídeo)
   está em `test/useCamera.spec.js`; a tela e o que ela pede ao sistema, em `test/app.spec.js`;
   as chaves de texto, em `test/textos.spec.js`.
5. **O nome do arquivo é permanente.** As fotos das pessoas estão nas Imagens como
   `RoqueOS_Photo_<hora>.jpg` e os vídeos como `RoqueOS_Video_<hora>.webm`: mudar o começo separa
   as fotos novas das antigas.
6. A câmera e o microfone vêm do navegador; os Arquivos, do `sistema`. A Câmera nunca guarda a
   imagem em outro lugar, nem manda para fora do aparelho sem a pessoa apertar salvar, baixar ou
   compartilhar.
7. Texto novo entra nos dez `i18n/*.json`, com as mesmas chaves, e a tela pede pela chave: o
   `app check` reprova se faltar um idioma, e o `textos.spec.js` se a tela pedir uma chave que
   não existe ou sobrar uma que ela não pede.
8. Rode `yarn verificar` antes de abrir o PR. É o mesmo que o CI roda. `yarn dev` abre a Câmera
   numa janela falsa do RoqueOS, com a câmera de verdade do seu computador.

Não mude o `id` do `app.json` (`camera`): é por ele que o RoqueOS acha a janela, o atalho e o
lugar dela no Big Picture.

O código novo, os comentários e as mensagens de commit são em português do Brasil (o motor que
veio do RoqueOS tem nomes em inglês, e fica assim). Issue e PR em inglês são bem-vindos. Ao
participar você concorda com o [código de conduta](CODE_OF_CONDUCT.md).

---

## Contributing (English)

The organization-wide guide is the
[roqueos-apps CONTRIBUTING](https://github.com/roqueos-apps/.github/blob/main/CONTRIBUTING.md).
Open an issue before changing what people see or what the Camera saves; fork, branch,
`yarn install --ignore-scripts`; sign off every commit (`git commit -s`); every fix comes with
a test that fails without it. The saved file name prefix is permanent. The camera never keeps or
sends a capture anywhere unless the person saves, downloads or shares it. New text goes into all
ten `i18n/*.json`; run `yarn verificar` before the pull request. Never change the `id` in
`app.json`.
