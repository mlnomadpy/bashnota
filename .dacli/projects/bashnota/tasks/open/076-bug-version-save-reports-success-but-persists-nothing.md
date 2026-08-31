---
id: t-01M1CQJ2D0F183RGRX8F04WVTS
kind: task
created: 2026-08-31T20:18:19Z
created_by: a-root
owner: a-root
github:
  issue: 64
  repo: mlnomadpy/bashnota
github_acceptance_import:
  issue: 64
  body_digest: sha256:d9bf3bdb1147001a508ff63a16d7252e82e4a5169ee26190c750aa5b13ae91c5
  actor: a-root
  imported_at: 2026-08-31T20:18:19Z
---
# Bug: version save reports success but persists nothing
## Context
Adopted from GitHub issue #64.

## Browser reproduction

1. Open a nota.
2. Choose File > Save The Version.
3. Open Version History.

## Observed

The UI shows both a success toast and an error toast. Version History remains empty. The browser console reports Dexie PrematureCommitError: Transaction committed too early from saveNotaVersionWithinPersistence.

## Expected

Success is shown only after the version transaction commits and the new version appears immediately in history.

## Acceptance criteria

- Version saving completes in one valid transaction.
- A failed transaction never emits success.
- History updates after successful save.
- Toast ownership is centralized so only one outcome is announced.
- Browser E2E covers save, reload, history, restore, delete, and failure rollback.

## Acceptance
- [ ] Version saving completes in one valid transaction.
- [ ] A failed transaction never emits success.
- [ ] History updates after successful save.
- [ ] Toast ownership is centralized so only one outcome is announced.
- [ ] Browser E2E covers save, reload, history, restore, delete, and failure rollback.
## Log
