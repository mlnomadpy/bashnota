---
id: 01KZRV8TKJQYW05C43WX90J9PP
kind: event
event_kind: finding
created: 2026-08-11T16:42:40Z
created_by: a-slice-auditor-9gyqp5
about: "[[001]]"
origin: agent
applied: false
---
File-relation map: 14 src/services files, importers and 3 zero-importer dead modules proven by grep

src/services has 14 .ts files (not 15; README.md is the 15th entry). LIVE, grep-proven importers: logger.ts (imported ~100+ files, universal); firebase.ts (main.ts, userTagGenerator, statisticsService, commentService, useNewsletter, UserPublishedView); axios.ts/fetchAPI (nota.ts, publishNotaUtilities, subNotaService); codeExecutionService.ts (editor/codeExecutionStore.ts:3); databaseAdapter.ts (main.ts:68 init + nota.ts:14 useDatabaseAdapter) = central persistence entry; storageService.ts (databaseAdapter, fileSystemBackend, migrationService, cachedStorageService); fileSystemBackend.ts (storageService dynamic import:189, fileWatcherService, useFilesystemNotas); directoryHandleStorage.ts (fileSystemBackend, StorageModeSettings, useFilesystemNotas); fileWatcherService.ts (only useStorageMode.ts:158); settingsAdapter.ts (only main.ts:118/120 provide, never injected). ZERO production importers (grep-proven, test/docs only) = DEAD: (a) cachedStorageService.ts 208 LOC — only its own test (corroborates sibling 01KZRT82EB); (b) migrationService.ts 250 LOC — only its own test; MigrationDialog.vue (its UI) also zero live importers, only MigrationDialog.test.ts (corroborates 01KZRT5SWX); (c) src/services/aiService.ts 308 LOC — only dead localagents.ts (see separate finding). consolidatedSettingsService.ts is live-but-dark: imported only by settingsAdapter which is never injected.
