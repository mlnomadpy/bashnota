---
id: t-01M1CQJ19NYHDBNXSW6S1MTAJ4
kind: task
created: 2026-08-31T20:18:18Z
created_by: a-root
owner: a-root
github:
  issue: 85
  repo: mlnomadpy/bashnota
github_acceptance_import:
  issue: 85
  body_digest: sha256:67a632d9692d53b9d0a4c5f2263ec114fe66faf55ed7d46dbe875b391c84d000
  actor: a-root
  imported_at: 2026-08-31T20:18:18Z
---
# Bug: make public profile identity and publication failures truthful
## Context
Adopted from GitHub issue #85.

## Confirmed findings

The live /@UIAuditTester route renders the known profile as generic Author whenever it has zero publications. authorName is derived only from the first published nota. Separately, publication-list failures are caught and converted to an empty array, so outages display This user hasn't published any notas yet and the error/retry branch is unreachable.

## Evidence

- Name fallback: src/features/bashhub/views/UserPublishedView.vue:166-171.
- Profile lookup already occurs at 202-211 but does not store/display the public name.
- Failure swallowed: src/features/nota/stores/nota.ts:1755-1765.
- Empty-state rendering: src/features/bashhub/views/UserPublishedView.vue:422-451 and 771-785.

## Acceptance criteria

- Render the public profile projection's display name even with zero publications.
- Preserve not-found, empty, loading, and service-failure as distinct states.
- Provide retry for transient failure.
- Add zero-publication and forced-RPC-failure browser tests.

## Acceptance
- [ ] Render the public profile projection's display name even with zero publications.
- [ ] Preserve not-found, empty, loading, and service-failure as distinct states.
- [ ] Provide retry for transient failure.
- [ ] Add zero-publication and forced-RPC-failure browser tests.
## Log
