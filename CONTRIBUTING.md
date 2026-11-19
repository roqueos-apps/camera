# Contributing

_[Português](docs/pt-BR/CONTRIBUTING.md) | English_

Thanks for wanting to help. The organization-wide guide is the [roqueos-apps CONTRIBUTING](https://github.com/roqueos-apps/.github/blob/main/CONTRIBUTING.md); here goes only what belongs to the Camera.

## How to contribute

1. Open an issue before changing what people see or what the Camera saves. A small fix can go straight to the pull request.
2. Fork, create a branch and run `yarn install --ignore-scripts`.
3. Every commit carries `Signed-off-by` (`git commit -s`, the DCO). The pull request's `dco` check fails without it; `git rebase --signoff main` fixes a branch that missed it.
4. Every fix comes with a test that fails without it. The engine (stream, crop, zoom, video) is in `test/useCamera.spec.js`; the screen and what it asks of the system, in `test/app.spec.js`; the text keys, in `test/textos.spec.js`.
5. **The file name is permanent.** People's photos are in Pictures as `RoqueOS_Photo_<time>.jpg` and videos as `RoqueOS_Video_<time>.webm`: changing the prefix splits new photos from old ones.
6. The camera and microphone come from the browser; Files, from the `sistema`. The Camera never keeps the image anywhere else, nor sends it off the device unless the person presses save, download or share.
7. New text goes into all ten `i18n/*.json`, with the same keys, and the screen asks by key: `app check` fails if a language is missing one, and `textos.spec.js` fails if the screen asks for a key that does not exist or one is left that it does not ask for.
8. Changed a feature or a test cited in `paridade.json`? Update the inventory in the same commit.
9. Run `yarn verificar` before opening the pull request. It is what CI runs. `yarn dev` opens the Camera in a fake RoqueOS window, with your computer's real camera.

Never change the `id` in `app.json` (`camera`): it is how RoqueOS finds the window, the shortcut and its place in Big Picture.

New code, comments and commit messages are in Brazilian Portuguese (the engine that came from RoqueOS has English names, and stays that way). Issues and pull requests in English are welcome. By taking part you agree to the [code of conduct](CODE_OF_CONDUCT.md). The rest of the documentation starts at [docs/INDEX.md](docs/INDEX.md).
