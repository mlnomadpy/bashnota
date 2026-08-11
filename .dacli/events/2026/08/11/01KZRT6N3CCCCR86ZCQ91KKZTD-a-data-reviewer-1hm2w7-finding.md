---
id: 01KZRT6N3CCCCR86ZCQ91KKZTD
kind: event
event_kind: finding
created: 2026-08-11T16:24:00Z
created_by: a-data-reviewer-1hm2w7
about: "[[t-01KZRSXR3X7GZNARQBY6SZRRMC]]"
origin: src/features/settings/components/advanced/StorageModeSettings.vue:54
applied: true
---
Switching storage mode runs NO migration — existing notas vanish from view after switch

MigrationService exists but has ZERO production callers (grep: 'new MigrationService' appears only in migrationService.test.ts). The mode-switch handler handleStorageModeChange (StorageModeSettings.vue:54-126) prompts for a directory, persists the handle via saveDirectoryHandle, sets mode='filesystem', and asks the user to reload — it never migrates data. main.ts:98 then re-inits the storage backend from the (freshly selected, empty) directory. Sequence to reproduce apparent data loss: (1) user has N notas in IndexedDB; (2) Settings > Advanced > Storage Mode -> File System, pick an empty folder; (3) reload. Result: FileSystemBackend.listNotas() (fileSystemBackend.ts:197) reads that folder and returns 0 notas — the user sees an empty app. Data is not deleted (still in IndexedDB) but is entirely invisible in filesystem mode, and the reverse switch has the same effect. There is no UI path that ever calls MigrationService.migrate().
