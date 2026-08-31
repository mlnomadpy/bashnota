---
id: t-01M1CQJ17ZGQ733T9CZ5C61M93
kind: task
created: 2026-08-31T20:18:18Z
created_by: a-root
owner: a-root
github:
  issue: 86
  repo: mlnomadpy/bashnota
github_acceptance_import:
  issue: 86
  body_digest: sha256:05ac4f86a1d3cb4b15e04226b890ac488ac21b94c402bd6f3df323b30e0aa4ef
  actor: a-root
  imported_at: 2026-08-31T20:18:18Z
---
# Bug: Delete All Data must clear every configured storage authority
## Context
Adopted from GitHub issue #86.

## Severity: P1

Settings promises permanent deletion of all notas, settings, and cache, but the implementation only calls localStorage.clear() and reloads. Canonical notas and blocks remain in IndexedDB or the selected filesystem and reappear.

## Evidence

- Promise and action: src/features/settings/components/advanced/DataManagementSettings.vue:131-145 and 285-313.
- Durable nota/content writes: src/features/nota/stores/nota.ts:803-819.
- The backup service enumerates the actual database tables at src/features/nota/services/backupArchiveService.ts:485-523.

## Acceptance criteria

- Enumerate and clear the active adapter plus all owned local database tables.
- Filesystem deletion requires explicit authority and names the exact directory/files affected.
- Failure is reported per authority; partial deletion never claims success.
- Verify post-reload absence with IndexedDB and filesystem E2E tests.
- Preserve the existing recoverable confirmation requirements in #66.

## Acceptance
- [ ] Enumerate and clear the active adapter plus all owned local database tables.
- [ ] Filesystem deletion requires explicit authority and names the exact directory/files affected.
- [ ] Failure is reported per authority; partial deletion never claims success.
- [ ] Verify post-reload absence with IndexedDB and filesystem E2E tests.
- [ ] Preserve the existing recoverable confirmation requirements in #66.
## Log
