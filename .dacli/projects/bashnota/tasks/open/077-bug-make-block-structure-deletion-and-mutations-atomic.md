---
id: t-01M1CQJ2EQVEXAXWMVY6G27FYR
kind: task
created: 2026-08-31T20:18:19Z
created_by: a-root
owner: a-root
github:
  issue: 63
  repo: mlnomadpy/bashnota
github_acceptance_import:
  issue: 63
  body_digest: sha256:0566aba7456c7674d04ff84710d829ed64abd79dbe2408f006b75465a12aa528
  actor: a-root
  imported_at: 2026-08-31T20:18:19Z
---
# Bug: make block structure deletion and mutations atomic
## Context
Adopted from GitHub issue #63.

## Observed

clearNotaBlocks deletes blockStructures using notaId even though the table uses an auto-increment primary key and notaId is only an index. Old structures can remain and later be selected again.

Block create, update, and reorder also persist typed rows and structure data in separate steps without an internal transaction. Direct store callers can leave memory, block rows, and ordering inconsistent.

Relevant code: src/features/nota/stores/blockStore.ts.

## Expected

All block rows and their structure are updated or rolled back together, and clearing a nota removes every structure row indexed by that nota.

## Acceptance criteria

- clearNotaBlocks deletes by the notaId index.
- Create, update, reorder, and clear use one persistence transaction.
- Reorder persists canonical order consistently.
- Tests simulate failure after every write boundary and verify rollback.
- Duplicate or stale structures cannot be resurrected.

## Acceptance
- [ ] clearNotaBlocks deletes by the notaId index.
- [ ] Create, update, reorder, and clear use one persistence transaction.
- [ ] Reorder persists canonical order consistently.
- [ ] Tests simulate failure after every write boundary and verify rollback.
- [ ] Duplicate or stale structures cannot be resurrected.
## Log
