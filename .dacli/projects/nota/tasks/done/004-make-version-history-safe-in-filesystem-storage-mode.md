---
id: t-01KZYAJ3AJT77KH326PRAPBDHY
kind: task
created: 2026-08-13T19:46:05Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 2, probable: 3, pessimistic: 5}"
---
# Make version history safe in filesystem storage mode
## So that
filesystem-backed notas do not expose version actions that bypass their authoritative storage backend
## Acceptance
- [x] In filesystem mode, version save, restore, and delete either work durably through one authoritative adapter-backed design or are disabled before mutation with a clear actionable UI explanation
- [x] No version action reads or writes db.notas for a filesystem-backed nota
- [x] Filesystem-mode integration tests cover save-edit-restore-reload and delete-reload when supported, or prove every version entry point is disabled without mutation when unsupported
- [x] Existing Dexie version-history atomic snapshot, restore, rollback, legacy compatibility, and block payload tests remain green
- [x] vue-tsc --build, full vitest, vite build, bundle budget, and git diff --check pass
## Log
- 2026-08-13T19:47:09Z claimed by a-root
- 2026-08-13T20:05:32Z accepted by a-root
- 2026-08-13T20:05:32Z verified by `cd /Users/tahabsn/Documents/GitHub/bashnota/.dacli/worktrees/nota-004-make-version-history-safe-in-filesystem-storage-mode && npx vue-tsc --build && npx vitest run && npx vite build && git diff --check` (exit 0)
- 2026-08-13T20:05:32Z deliverable: dacli/004-make-version-history-safe-in-filesystem-storage-mode exists but is NOT in master — closed anyway
- 2026-08-13T20:05:32Z completed by a-root
