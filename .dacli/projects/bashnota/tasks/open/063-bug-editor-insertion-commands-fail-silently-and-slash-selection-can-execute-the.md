---
id: t-01M1CQJ1PRTQ13YGXAF5YSFQJA
kind: task
created: 2026-08-31T20:18:18Z
created_by: a-root
owner: a-root
github:
  issue: 77
  repo: mlnomadpy/bashnota
github_acceptance_import:
  issue: 77
  body_digest: sha256:af52c6f164e90c1dab2e0b09ba400f8457cce8b20be2f02fd29d73d664f28df3
  actor: a-root
  imported_at: 2026-08-31T20:18:18Z
---
# Bug: editor insertion commands fail silently and slash selection can execute the wrong item
## Context
Adopted from GitHub issue #77.

## Summary

The editor's insertion paths are not reliable after focusing a nota body. During real-browser E2E:

- **Insert > Code Block** repeatedly closed the menu without inserting anything.
- Clicking the visible **Code Block** slash-command option left the chooser open and inserted nothing.
- Filtering the slash chooser to `code block`, pressing ArrowDown, then Enter inserted **Execution Pipeline** instead of Code Block.
- The failures showed no toast or inline error.

## Why this matters

This blocks discoverability and makes keyboard behavior non-deterministic. It also prevented the executable-code/Jupyter workflow from reaching the configured kernel through the editor UI even though the server connection and kernel discovery succeeded.

## Acceptance criteria

- Menubar insertion preserves or restores a valid editor selection before running the command.
- Clicking a slash-command option executes that exact option and closes the chooser.
- Keyboard navigation starts on the visually active item and Enter executes the highlighted item without an off-by-one jump.
- Failed commands provide user-visible feedback.
- Add Playwright coverage for blank and non-empty notas, mouse selection, and keyboard selection.

## Acceptance
- [ ] Menubar insertion preserves or restores a valid editor selection before running the command.
- [ ] Clicking a slash-command option executes that exact option and closes the chooser.
- [ ] Keyboard navigation starts on the visually active item and Enter executes the highlighted item without an off-by-one jump.
- [ ] Failed commands provide user-visible feedback.
- [ ] Add Playwright coverage for blank and non-empty notas, mouse selection, and keyboard selection.
## Log
