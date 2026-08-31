---
id: t-01M1CQJ1BEDHK223W875CD1Q1P
kind: task
created: 2026-08-31T20:18:18Z
created_by: a-root
owner: a-root
github:
  issue: 84
  repo: mlnomadpy/bashnota
github_acceptance_import:
  issue: 84
  body_digest: sha256:d0c42afa9d571f9ef6f4e5dc1b256eb0fcca461b9b0171e786c71e834cf64cf9
  actor: a-root
  imported_at: 2026-08-31T20:18:18Z
---
# Bug: increment clone statistics only after a clone commits
## Context
Adopted from GitHub issue #84.

Clone analytics are written before the local clone exists and the CloudResult is ignored. If local storage or filesystem writes fail, the clone rolls back but the public source still gains a clone count.

## Evidence

- src/features/nota/stores/nota.ts:1823-1836 records the clone first.
- Local clone mutations occur afterward at 1838-2004.
- Rollback/failure happens only at 2005-2018.

## Acceptance criteria

- Commit the local clone first, then record analytics with explicit result handling; or use an idempotent server transaction/saga.
- Failed local clones do not affect public counters.
- Retrying cannot double-count.
- Add injected storage-failure and retry integration tests.

## Acceptance
- [ ] Commit the local clone first, then record analytics with explicit result handling; or use an idempotent server transaction/saga.
- [ ] Failed local clones do not affect public counters.
- [ ] Retrying cannot double-count.
- [ ] Add injected storage-failure and retry integration tests.
## Log
