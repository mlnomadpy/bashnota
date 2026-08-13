---
id: t-01KZYA074ZGJ4MH081MPD5KPGR
kind: task
created: 2026-08-13T19:36:19Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 1, probable: 2, pessimistic: 4}"
---
# Make canonical block deletion atomic and preserve numeric Dexie keys
## So that
deleted blocks cannot survive as orphan rows and resurrect after a fresh load
## Acceptance
- [x] Block/BaseBlock IDs and database get/delete APIs preserve string or number key identity without coercing numeric Dexie keys to strings
- [x] An integration test creates a numeric-ID block, deletes the final block, resets stores and fresh-loads, and proves the typed-table row, body, and block order remain empty
- [x] Typed-row deletion and block-structure update occur in one Dexie transaction; injected failure rolls back database and Pinia state without partial deletion
- [x] Deletion behavior remains correct for explicitly string-keyed compatibility records
- [x] vue-tsc --build, full vitest, vite build, bundle budget, and git diff --check pass
## Log
- 2026-08-13T19:37:20Z claimed by a-root
- 2026-08-13T19:45:38Z accepted by a-root
- 2026-08-13T19:45:38Z verified by `cd /Users/tahabsn/Documents/GitHub/bashnota/.dacli/worktrees/nota-003-make-canonical-block-deletion-atomic-and-preserve-numeric-dexie-keys && npx vue-tsc --build && npx vitest run && npx vite build && git diff --check` (exit 0)
- 2026-08-13T19:45:38Z deliverable: dacli/003-make-canonical-block-deletion-atomic-and-preserve-numeric-dexie-keys exists but is NOT in master — closed anyway
- 2026-08-13T19:45:38Z completed by a-root
