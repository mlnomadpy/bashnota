---
id: 01KZRTANCD02EK7ARZG6ZWR5X1
kind: event
event_kind: finding
created: 2026-08-11T16:26:12Z
created_by: a-architecture-reviewer-yksca5
about: "[[t-01KZRSX01WV40GJGSSYCFMBS7Y]]"
origin: src/services/migrationService.ts:46
applied: true
---
Roughly 1,825 LOC is dead or dark: orphaned modules (~1,069) plus one never-default navigation stack (~912)

Rollup of code carried but not reachable in a default install. ORPHANED (imported only by tests, never by app): migrationService.ts 230 + MigrationDialog.vue 156 + cachedStorageService.ts 156 + consolidatedSettingsService.ts 199 + settingsAdapter.ts 328 = 1,069 LOC. DARK (behind default-off USE_SIMPLIFIED_NAVIGATION, one of two nav stacks never rendered): SimplifiedMenubar.vue 295 + ThreePanelLayout.vue 178 + CommandPalette.vue 314 + simplifiedNavigationStore.ts 125 = 912 LOC (or the ~909 LOC legacy stack is the redundant one, depending on which is chosen). Combined ~1,825-1,981 LOC. This excludes the new-storage stack (storageService/databaseAdapter/fileSystemBackend/directoryHandleStorage), which IS reachable via filesystem mode and should be finished rather than deleted. Numbers are whole-file wc -l; some files mix live and dead code.
