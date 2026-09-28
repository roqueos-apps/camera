# Câmera

App da organização roqueos-apps, montado pelo RoqueOS através do `app-sdk`. Leia o README
antes de mudar qualquer coisa.

- Gate: `yarn verificar` (o mesmo do CI e do pre-push).
- O app só importa `vue`, `@roqueos-apps/app-sdk`, `@roqueos-apps/ui` e arquivo deste repo. O
  `app check` e a catraca `apps-fora-do-nucleo` do RoqueOS reprovam o resto.
- A câmera e o microfone vêm do navegador (`getUserMedia`); os Arquivos, do `sistema`. O app
  declara só a pasta `Imagens`, e o nome do arquivo salvo (`RoqueOS_Photo_`, `RoqueOS_Video_`) e
  o `id` (`camera`) são permanentes.
- Sem conta, salvar recusa com `sem-conta`: a captura fica na tela, e baixar e compartilhar
  continuam.
- Fechar a janela desliga a câmera (o `onUnmounted` do motor para as trilhas): o teste do
  desmontar confere.
- JSON de texto entra com `?raw` e `JSON.parse` (`src/textos.js`): o build do RoqueOS quebra
  com import de JSON direto, e é por isso que `src/index.js` repete as capacidades do
  `app.json` (o teste confere que batem). Chave de texto sem ponto: o `app check` lê ponto como
  caminho. O `textos.spec.js` cruza as chaves da tela com os dez JSON.
- Do tema do RoqueOS só as variáveis CSS do contrato do SDK; as cores do app são `--camera-*`.
- Toda correção vem com teste que reprova sem ela; check novo passa por mutação.
- Todo commit com `Signed-off-by` (`git commit -s`): o workflow `dco` reprova sem.
- Português do Brasil no código novo e nos commits.
