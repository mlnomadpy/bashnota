---
id: t-01M1CQJ29M2MJF9JW66645JHG7
kind: task
created: 2026-08-31T20:18:19Z
created_by: a-root
owner: a-root
github:
  issue: 66
  repo: mlnomadpy/bashnota
github_acceptance_import:
  issue: 66
  body_digest: sha256:232390cca0a45afe7a7330c99f2ddff1bb93243b6a661e76eee41daea42f3759
  actor: a-root
  imported_at: 2026-08-31T20:18:19Z
---
# Bug: require recoverable confirmation for nota deletion across all entry points
## Context
Adopted from GitHub issue #66.

## Browser reproduction

- Click the Delete icon in the home nota table.
- Compare with Edit Nota > Actions > Delete Nota.

## Observed

The table deletes immediately with no confirmation or Undo. The edit dialog uses a native window.confirm. Other destructive flows use still different patterns.

## Expected

Every nota deletion uses the same accessible, recoverable confirmation flow.

## Acceptance criteria

- Use shadcn AlertDialog rather than window.confirm.
- Dialog names the nota and explains child/sub-nota impact.
- Destructive action is visually distinct and is not initial focus.
- Successful deletion offers Undo or a recoverable soft-delete interval.
- Focus returns to the next logical row/action.
- Table, bulk, tree, and edit-dialog deletion share one implementation.

## Acceptance
- [ ] Use shadcn AlertDialog rather than window.confirm.
- [ ] Dialog names the nota and explains child/sub-nota impact.
- [ ] Destructive action is visually distinct and is not initial focus.
- [ ] Successful deletion offers Undo or a recoverable soft-delete interval.
- [ ] Focus returns to the next logical row/action.
- [ ] Table, bulk, tree, and edit-dialog deletion share one implementation.
## Log
