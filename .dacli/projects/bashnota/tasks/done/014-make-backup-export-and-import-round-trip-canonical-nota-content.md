---
id: t-01M0D7BYHA22KG8T5NWN3X3N03
kind: task
created: 2026-08-19T14:38:54Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 3, probable: 5, pessimistic: 8}"
---
# Make backup export and import round-trip canonical nota content
## So that
Export All is a truthful disaster-recovery backup rather than metadata-only JSON
## Acceptance
- [x] Export includes every nota's metadata, hierarchy, versions, canonical block order, and all 22 typed block payloads in one versioned format
- [x] Import validates the complete archive before mutation and restores it into an empty database with semantic equality after a fresh store reload
- [x] Injected failures roll back metadata, structures, typed rows, and Pinia state without partial imports
- [x] The mounted settings UI imports the exact emitted format and reports truthful success and actionable failure
- [x] Focused integration tests, full Vitest, typecheck, production build, bundle budget, and diff-check pass
## Log
- 2026-08-19T14:41:32Z claimed by a-codex-fixer-2w4cvm
- 2026-08-20T08:22:01Z accepted by a-root
- 2026-08-20T08:22:01Z verified by `cd /Users/tahabsn/Documents/GitHub/bashnota/.dacli/worktrees/bashnota-014-make-backup-export-and-import-round-trip-canonical-nota-content && npm run type-check && npx vitest run src/features/nota/services/__tests__/backupArchiveService.test.ts src/features/nota/stores/__tests__/notaBackupAuthority.test.ts src/features/nota/stores/__tests__/blockStoreReload.test.ts src/features/settings/components/advanced/__tests__/DataManagementSettings.test.ts && git diff --check master...HEAD` (exit 0)
- 2026-08-20T08:22:01Z completed by a-root
