---
id: t-01M1CQJ1HAN848R836SCZFJJDY
kind: task
created: 2026-08-31T20:18:18Z
created_by: a-root
owner: a-root
github:
  issue: 81
  repo: mlnomadpy/bashnota
github_acceptance_import:
  issue: 81
  body_digest: sha256:97d1eeae9a86154a776c5632beb717bdee5dd8f9968843f983e2b69abb50885a
  actor: a-root
  imported_at: 2026-08-31T20:18:18Z
---
# Bug: make native and notebook imports atomic and truthful
## Context
Adopted from GitHub issue #81.

## Severity: P1

Native multi-nota import prevalidates but then performs sequential durable metadata/content writes. A later failure returns an empty result without rollback, leaving earlier additions/overwrites committed while the UI reports total failure. Notebook import similarly catches individual block-save failures and still reports success with missing cells.

## Evidence

- src/features/nota/stores/nota.ts:716-839 validates first but mutates sequentially and converts failure to an empty result.
- src/features/nota/composables/useNotaImport.ts:44-58 reports the empty result without reloading partial mutations.
- src/features/nota/composables/useNotaImport.ts:100-151 creates the nota first, ignores block failures, then reports success.

## Acceptance criteria

- Stage and validate the entire import before visible mutation.
- IndexedDB imports use one transaction; filesystem imports use compensation/rollback.
- Overwritten originals are restored on failure.
- Notebook cell failures fail the import or are explicitly reported with a recoverable partial-import UI.
- Add injected-failure tests at every mutation boundary.

## Acceptance
- [ ] Stage and validate the entire import before visible mutation.
- [ ] IndexedDB imports use one transaction; filesystem imports use compensation/rollback.
- [ ] Overwritten originals are restored on failure.
- [ ] Notebook cell failures fail the import or are explicitly reported with a recoverable partial-import UI.
- [ ] Add injected-failure tests at every mutation boundary.
## Log
