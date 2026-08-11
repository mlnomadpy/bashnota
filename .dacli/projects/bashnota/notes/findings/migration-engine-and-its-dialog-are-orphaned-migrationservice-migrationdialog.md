---
id: f-migration-engine-and-its-dialog-are-orphaned-migrationservice-migrationdialog
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-architecture-reviewer-yksca5
about: "[[t-01KZRSX01WV40GJGSSYCFMBS7Y]]"
origin: src/services/migrationService.ts:46
source_event: 01KZRT5SWXAX1YFGC25PFTX8PH
---
# Migration engine and its dialog are orphaned: MigrationService + MigrationDialog.vue are imported only by their own tests, never wired into the app
src/services/migrationService.ts (class MigrationService, ~230 LOC, the only code that copies notas source->target with progress/verify/rollback) is imported nowhere in app code — grep for new MigrationService / import migrationService returns only src/services/__tests__/migrationService.test.ts. Likewise src/components/MigrationDialog.vue is referenced only by src/components/__tests__/MigrationDialog.test.ts, never mounted in any view/router. main.ts:98 calls initializeDatabaseAdapter but never MigrationService.migrate(). So the one component that would move existing IndexedDB data onto the filesystem when a user switches modes is dead code. This is WHY flipping storage cannot preserve data — the migration path was built and tested but never connected.
