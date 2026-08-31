---
id: t-01M1CQJ2BA2QEYKN4V7B3R4FEX
kind: task
created: 2026-08-31T20:18:19Z
created_by: a-root
owner: a-root
github:
  issue: 65
  repo: mlnomadpy/bashnota
github_acceptance_import:
  issue: 65
  body_digest: sha256:f6341e1b6d5a40c5c870c540dccf00b0b335dc96f25651d46467b3236c10c088
  actor: a-root
  imported_at: 2026-08-31T20:18:19Z
---
# Bug: make the editor usable at mobile widths
## Context
Adopted from GitHub issue #65.

## Browser reproduction

Open any nota at 390 by 844.

## Observed

The editor suppresses horizontal scrolling while controls extend beyond the viewport. Run, Help, History, Export, split controls, and part of the editing canvas are unreachable. The Configure Jupyter notice is also visually uncontained above the toolbar.

## Expected

All primary editor actions and the complete writing surface remain reachable on supported mobile widths.

## Acceptance criteria

- Editor has no clipped interactive controls at 320, 375, 390, and 768 px.
- Secondary menubar and pane actions collapse into an overflow menu.
- Canvas width never exceeds the content viewport.
- Jupyter setup uses a contained alert or toast with a clear action.
- Responsive Playwright coverage checks bounding boxes and horizontal overflow.

## Acceptance
- [ ] Editor has no clipped interactive controls at 320, 375, 390, and 768 px.
- [ ] Secondary menubar and pane actions collapse into an overflow menu.
- [ ] Canvas width never exceeds the content viewport.
- [ ] Jupyter setup uses a contained alert or toast with a clear action.
- [ ] Responsive Playwright coverage checks bounding boxes and horizontal overflow.
## Log
