# Segurança

## Como reportar

Não abra issue pública para falha de segurança. Use o
[relatório privado de vulnerabilidade](https://github.com/roqueos-apps/camera/security/advisories/new)
do GitHub. A resposta vem em até sete dias. A política completa está no
[SECURITY da roqueos-apps](https://github.com/roqueos-apps/.github/blob/main/SECURITY.md).

## O que vale aqui

A Câmera roda **na mesma origem** do RoqueOS e liga a câmera e o microfone do aparelho. O que
protege quem usa o RoqueOS é:

- a câmera só liga com a janela aberta e desliga quando ela fecha; o microfone só entra no modo
  vídeo;
- a imagem ao vivo não sai do aparelho, e a foto ou o vídeo só sai quando a pessoa aperta
  salvar (os Arquivos da conta dela), baixar ou compartilhar;
- a Câmera não fala com banco nem com o Storage: os Arquivos são do sistema, que decide onde
  moram e com que regra, e ela só abre a pasta que declara (Imagens), sem ver caminho nem listar
  o que a pessoa tem; o `app check` reprova import do Firebase ou de dentro do RoqueOS;
- todo merge passa pela revisão do mantenedor (`CODEOWNERS`), e todo commit tem
  `Signed-off-by`;
- o RoqueOS instala o app por uma tag exata, com o commit travado no lockfile;
- nenhum script roda sozinho no install, e o CI de pull request não lê segredo nenhum.

---

## Security (English)

Do not open public issues for vulnerabilities; use GitHub's private vulnerability reporting.
The Camera runs on the same origin as RoqueOS and turns on the device camera (and the
microphone only in video mode) while its window is open, switching it off when the window
closes. The live image never leaves the device; a capture leaves only when the person saves,
downloads or shares it. It has no database or storage access of its own (the system owns Files,
and the app only opens the one folder it declares, never seeing a path), is pinned by exact
tag, and has no install-time scripts or CI secrets.
