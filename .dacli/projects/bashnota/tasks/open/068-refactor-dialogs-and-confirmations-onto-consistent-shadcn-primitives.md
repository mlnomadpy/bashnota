---
id: t-01M1CQJ1ZA7B9D1601EQP3EVH1
kind: task
created: 2026-08-31T20:18:19Z
created_by: a-root
owner: a-root
github:
  issue: 72
  repo: mlnomadpy/bashnota
github_acceptance_import:
  issue: 72
  body_digest: sha256:32e93c56f9c40959272d3828ec8ccc9f04c997ec2f2f5f7364c55d830ce59d8a
  actor: a-root
  imported_at: 2026-08-31T20:18:19Z
---
# Refactor dialogs and confirmations onto consistent shadcn primitives
## Context
Adopted from GitHub issue #72.

## Audit summary

The repository uses shadcn components extensively, but still contains about 98 raw button usages alongside roughly 542 shadcn Button usages. Destructive and overlay behavior is inconsistent: immediate deletion, native window.confirm, Dialog, and ad hoc modal implementations coexist.

Product dialog files missing DialogDescription include VersionHistoryDialog, NotaTree, CommentItem, and NotaEditMenu.

## Recommended system

- AlertDialog for destructive confirmation.
- Dialog for focused short forms.
- Sheet for mobile navigation and long secondary panels.
- Drawer only for touch-first bottom tasks.
- DropdownMenu for compact secondary actions.
- Tooltip plus aria-label for icon-only buttons.
- Toast for transient outcomes, with one owner per action.

## Acceptance criteria

- No product flow uses native confirm or alert.
- Shared destructive-action and responsive-dialog wrappers define focus, copy, sizing, and pending states.
- Raw buttons are retained only where semantic/custom behavior is documented.
- Dialog close controls meet a 44 px mobile touch target.
- Storybook or visual fixtures cover mobile/desktop dialog variants and long translated text.

## Acceptance
- [ ] No product flow uses native confirm or alert.
- [ ] Shared destructive-action and responsive-dialog wrappers define focus, copy, sizing, and pending states.
- [ ] Raw buttons are retained only where semantic/custom behavior is documented.
- [ ] Dialog close controls meet a 44 px mobile touch target.
- [ ] Storybook or visual fixtures cover mobile/desktop dialog variants and long translated text.
## Log
