# Camera documentation

_[Português](pt-BR/INDEX.md) | English_

The Camera app of RoqueOS, in its own open repository: photos and videos with the device camera, saved to Pictures in Files. This is the map for contributors and the maintainer.

Where to start depends on what you want.

| I want to...                                  | Read                                                                                         |
| --------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Install and see it working**                | [GETTING-STARTED.md](GETTING-STARTED.md): from zero to the Camera in a fake RoqueOS window   |
| **Maintain it and cut a release**             | [OPERATIONS.md](OPERATIONS.md): routine, release, updating, undoing, what to watch           |
| **Understand a failure**                      | [WHEN-IT-BREAKS.md](WHEN-IT-BREAKS.md): symptom, cause, what to do                           |
| **See how it is inside**                      | [ARCHITECTURE.md](ARCHITECTURE.md): context, processes, components, flows, decisions, limits |
| **Look up a command, file or key**            | [REFERENCE.md](REFERENCE.md)                                                                 |
| **Know what RoqueOS and the Camera exchange** | [INTEGRATIONS.md](INTEGRATIONS.md): install, mount, every system call                        |
| **Know which test covers what**               | [TESTING.md](TESTING.md): the gate, the suites, parity                                       |
| **Know what it protects**                     | [THREAT-MODEL.md](THREAT-MODEL.md)                                                           |
| **Find a term**                               | [GLOSSARY.md](GLOSSARY.md)                                                                   |
| **Contribute**                                | [CONTRIBUTING.md](../CONTRIBUTING.md)                                                        |
| **See what changed**                          | [CHANGELOG.md](../CHANGELOG.md)                                                              |
| **Report a vulnerability**                    | [SECURITY.md](../SECURITY.md)                                                                |

## Diagrams

| Diagram                                           | Source                                                                                     | Explained in                                                    |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| Context (the Camera, the browser, RoqueOS, Files) | Mermaid in [ARCHITECTURE.md](ARCHITECTURE.md#2-context-who-uses-it-and-what-it-depends-on) | the same section                                                |
| Opening the window                                | Mermaid in [ARCHITECTURE.md](ARCHITECTURE.md#51-opening-the-window)                        | the same section                                                |
| Taking and saving a photo                         | Mermaid in [ARCHITECTURE.md](ARCHITECTURE.md#52-taking-and-saving-a-photo)                 | the same section                                                |
| Recording a video                                 | Mermaid in [ARCHITECTURE.md](ARCHITECTURE.md#53-recording-a-video)                         | the same section                                                |
| Closing the window                                | Mermaid in [ARCHITECTURE.md](ARCHITECTURE.md#54-closing-the-window)                        | the same section                                                |
| The README overview                               | Mermaid in [README.md](../README.md#architecture)                                          | the README                                                      |
| The README cover, `capa.jpg`                      | a Playwright screenshot inside RoqueOS, 28/09/2026 ([ASSETS.md](../ASSETS.md))             | [ARCHITECTURE.md](ARCHITECTURE.md#10-how-the-diagrams-are-made) |
