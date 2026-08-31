---
id: t-01M1CQJ266N93DF4NCGQDR88WB
kind: task
created: 2026-08-31T20:18:19Z
created_by: a-root
owner: a-root
github:
  issue: 68
  repo: mlnomadpy/bashnota
github_acceptance_import:
  issue: 68
  body_digest: sha256:8d3d08cec7addf744c77bc013877c15da855516d7e8c0842c307ad440053eaa7
  actor: a-root
  imported_at: 2026-08-31T20:18:19Z
---
# Bug: redesign the Settings shell for mobile and restore app navigation
## Context
Adopted from GitHub issue #68.

## Browser reproduction

Open Editor Shortcuts or Storage Mode at 390 by 844.

## Observed

The settings navigation consumes a large part of the viewport, cards force headings and action buttons into narrow columns, shortcut tables clip edit actions, and the persistent Changes will be saved automatically banner obscures content and remains visible without changes. Settings and Profile also lack an obvious route back to notas.

## Expected

Settings should behave as a responsive app surface with predictable navigation and non-obstructive save status.

## Acceptance criteria

- Mobile category navigation uses a shadcn Sheet or compact Select.
- Header provides Back or Home navigation.
- Card headers stack actions below titles when needed.
- Shortcut rows become mobile cards or a horizontally contained table.
- Save state appears only while dirty/saving and resolves to a short non-blocking status.
- Save status layers below active dialogs and never covers actions.

## Acceptance
- [ ] Mobile category navigation uses a shadcn Sheet or compact Select.
- [ ] Header provides Back or Home navigation.
- [ ] Card headers stack actions below titles when needed.
- [ ] Shortcut rows become mobile cards or a horizontally contained table.
- [ ] Save state appears only while dirty/saving and resolves to a short non-blocking status.
- [ ] Save status layers below active dialogs and never covers actions.
## Log
