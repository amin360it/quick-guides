# `build/` — temp and build work (all inside this repo)

Everything that is **not** part of the shipped library lives here. Nothing may be
written outside this repository, and no scratch file may be placed at the repo
root — a stray `.html` at the root would be picked up as a shipped page.

| Location | What goes there |
|---|---|
| `build/*.js` | Verifier and generator scripts, run from `build/` (see the "Verifiers" table in `AGENTS.md`). |
| `build/tmp/` | Scratch files, experiments, extracted fragments, one-off lint runs. Safe to delete. |
| `build/bak/` | Backups taken **before** any tool writes a guide. `build/bak/green/` = last state that passed the whole suite. |
| `build/edits/` | Data files consumed by `patchsec.js` (`[{ id, html }]`). |

Rules:

1. Never put temp or build work anywhere else in the repo, and never outside it.
2. Never leave a backup beside the guide it shadows — always under `build/bak/`.
3. After any work that changes the library, update the **Work Log** and the
   **File Index** in `../AGENTS.md`.

See "Work Log & Working Folders" in `AGENTS.md`.
