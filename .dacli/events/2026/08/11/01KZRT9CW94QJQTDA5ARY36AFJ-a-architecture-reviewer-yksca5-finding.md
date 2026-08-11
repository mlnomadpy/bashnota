---
id: 01KZRT9CW94QJQTDA5ARY36AFJ
kind: event
event_kind: finding
created: 2026-08-11T16:25:30Z
created_by: a-architecture-reviewer-yksca5
about: "[[t-01KZRSX01WV40GJGSSYCFMBS7Y]]"
origin: src/features/nota/stores/nota.ts:124
applied: true
---
Nota flow map UI-to-disk in both modes: identical store/adapter layers, diverging only at the leaf backend

FLOW (both modes share layers 1-4): (1) UI/components call Pinia actions on useNotaStore (nota.ts:124) e.g. createItem/saveItem/deleteItem (nota.ts:231,246,318). (2) Each action calls getDb() (nota.ts:107) which returns the DatabaseAdapter singleton (databaseAdapter.ts:100,126) or null. (3) DatabaseAdapter.saveNota/getNota (databaseAdapter.ts:23-72) checks this.useNewStorage. (4a) LEGACY/flag off: adapter calls db.notas.put/get/toArray directly (databaseAdapter.ts:28,38,48) -> Dexie -> IndexedDB (db.ts:277). (4b) NEW/flag on: adapter calls this.storage.readNota/writeNota (databaseAdapter.ts:25,45) -> StorageService (storageService.ts:275-311) -> selected IStorageBackend. The backend is chosen in StorageService.doInitialize (storageService.ts:183-260): filesystem mode -> FileSystemBackend writes one JSON .nota file per nota to the user directory (fileSystemBackend.ts:16); else IndexedDBBackend which STILL wraps db.notas (storageService.ts:99-157) — i.e. new-storage+indexeddb and legacy both end at the same Dexie table. Mode is selected at boot in main.ts:84-98 from localStorage bashnota-storage-mode. NOTE: this clean map holds ONLY for whole-nota CRUD; versions/subpages/blocks bypass it (see split-brain finding).
