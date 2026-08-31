---
id: t-01M1CQJ210J8JC79YZF21EPZMN
kind: task
created: 2026-08-31T20:18:19Z
created_by: a-root
owner: a-root
github:
  issue: 71
  repo: mlnomadpy/bashnota
github_acceptance_import:
  issue: 71
  body_digest: sha256:d8a7a23a979a4867e1e9ad95c223dbbad0babb44068260bfaeb768c75d2da85c
  actor: a-root
  imported_at: 2026-08-31T20:18:19Z
---
# Accessibility: fix keyboard and screen-reader semantics across notes, editor, filters, and sidebar
## Context
Adopted from GitHub issue #71.

## Confirmed browser findings

- Home table rows are mouse-clickable but the nota title is not a link/button and the row has no keyboard behavior.
- Editor title and document contenteditable regions have no accessible names.
- The View combobox in filters has no accessible name.
- Authenticated sidebar Settings and Logout icon buttons have no aria-label or title.
- Shortcut edit buttons are unnamed.
- Mobile sidebar is an unnamed dialog and lacks a visible close control.
- Version History and several product dialogs omit DialogDescription.

## Acceptance criteria

- Every interactive element has a stable accessible name.
- Nota titles are links or buttons reachable with Tab and Enter.
- Contenteditable regions expose roles, labels, and relevant descriptions.
- Icon-only shadcn Buttons use size icon plus aria-label and Tooltip.
- Dialogs have DialogTitle and DialogDescription; decorative descriptions may be sr-only.
- axe and keyboard-only browser tests cover home, editor, settings, profile, and dialogs.

## Acceptance
- [ ] Every interactive element has a stable accessible name.
- [ ] Nota titles are links or buttons reachable with Tab and Enter.
- [ ] Contenteditable regions expose roles, labels, and relevant descriptions.
- [ ] Icon-only shadcn Buttons use size icon plus aria-label and Tooltip.
- [ ] Dialogs have DialogTitle and DialogDescription; decorative descriptions may be sr-only.
- [ ] axe and keyboard-only browser tests cover home, editor, settings, profile, and dialogs.
## Log
