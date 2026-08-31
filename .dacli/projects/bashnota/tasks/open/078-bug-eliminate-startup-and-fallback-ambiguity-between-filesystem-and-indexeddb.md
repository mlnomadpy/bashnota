---
id: t-01M1CQJ2GEY8G0EPEB2HW841RM
kind: task
created: 2026-08-31T20:18:19Z
created_by: a-root
owner: a-root
priority: must
github:
  issue: 62
  repo: mlnomadpy/bashnota
github_acceptance_import:
  issue: 62
  body_digest: sha256:95f73f120e33ec65b9542c6aee3544f3fc956d7b4de0c1353ded6c8d14030769
  actor: a-root
  imported_at: 2026-08-31T20:18:19Z
estimate: "{optimistic: 5, probable: 8, pessimistic: 13}"
---
# Bug: eliminate startup and fallback ambiguity between filesystem and IndexedDB storage
## Context
Adopted from GitHub issue #62.

## Reproduction

1. Persist filesystem mode.
2. Reload while storage adapter initialization is still in progress or make filesystem initialization fail.
3. Create, edit, or load notas during startup.

## Observed

The application mounts before the database adapter is ready. Nota operations can fall back to legacy IndexedDB, and filesystem initialization may silently fall through to IndexedDB or memory while the UI still reports filesystem mode.

Relevant areas: src/main.ts, src/services/storageService.ts, src/composables/useStorageMode.ts, and src/features/nota/stores/nota.ts.

## Expected

The UI must not expose an authoritative library until the selected backend is resolved. A fallback must be explicit, visible, and reflected by storage-mode state.

## Acceptance criteria

- App startup waits for an authoritative backend decision.
- No reads or writes cross storage authorities during initialization.
- Filesystem failure presents a recover/retry choice.
- UI displays the actual active backend.
- Tests cover delayed initialization, denied permission, unavailable handles, and memory fallback.

## Acceptance
- [ ] App startup waits for an authoritative backend decision.
- [ ] No reads or writes cross storage authorities during initialization.
- [ ] Filesystem failure presents a recover/retry choice.
- [ ] UI displays the actual active backend.
- [ ] Tests cover delayed initialization, denied permission, unavailable handles, and memory fallback.
## Log
- 2026-08-31T20:22:04Z claimed by a-bashnota-implementer-zqwg4y
