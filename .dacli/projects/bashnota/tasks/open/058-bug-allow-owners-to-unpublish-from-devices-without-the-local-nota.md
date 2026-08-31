---
id: t-01M1CQJ1D667AV46A038QFKXH1
kind: task
created: 2026-08-31T20:18:18Z
created_by: a-root
owner: a-root
github:
  issue: 83
  repo: mlnomadpy/bashnota
github_acceptance_import:
  issue: 83
  body_digest: sha256:be72ef84668d9ee8329dc3cd2645f41fa058cd92a29b80d753e187f482b510b3
  actor: a-root
  imported_at: 2026-08-31T20:18:18Z
---
# Bug: allow owners to unpublish from devices without the local nota
## Context
Adopted from GitHub issue #83.

## Severity: P1

The public profile lists remote owner publications and offers Unpublish, but the handler requires getCurrentNota(id) before deleting remotely. On a second or cleared browser, the owner can see a publication yet cannot remove it.

## Evidence

- Profile action: src/features/bashhub/views/UserPublishedView.vue:657-687.
- Local hard dependency: src/features/nota/stores/nota.ts:1669-1673.

## Acceptance criteria

- Authorize remote unpublish from authenticated ownership, independent of local storage.
- Reconcile any existing local record after remote success when present.
- Provide retryable error feedback without falsely changing either side.
- Add two-browser/device E2E coverage: publish on A, unpublish on empty B, verify public URL is removed.

## Acceptance
- [ ] Authorize remote unpublish from authenticated ownership, independent of local storage.
- [ ] Reconcile any existing local record after remote success when present.
- [ ] Provide retryable error feedback without falsely changing either side.
- [ ] Add two-browser/device E2E coverage: publish on A, unpublish on empty B, verify public URL is removed.
## Log
