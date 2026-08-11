---
id: 01KZRT8R0F4JB2F5A8TNV8XS7D
kind: event
event_kind: finding
created: 2026-08-11T16:25:09Z
created_by: a-architecture-reviewer-yksca5
about: "[[t-01KZRSX01WV40GJGSSYCFMBS7Y]]"
origin: src/features/bashhub/composables/useFilesystemNotas.ts:58
applied: true
---
Three independent code paths write/read notas on disk; the storage abstraction is routinely bypassed

There is no single source of truth for nota persistence. Path 1 (intended): nota store getDb() -> DatabaseAdapter (databaseAdapter.ts:23) -> StorageService (storageService.ts:275) -> backend. Path 2 (bypass): nota store writes straight to Dexie via db.notas.* (nota.ts:688,734,829,863,982,1305,1367). Path 3 (bypass): useFilesystemNotas.ts:58 does `new FileSystemBackend()` and calls backend.listNotas() directly, skipping StorageService, the adapter, and the store entirely — it even re-implements handle checks (useFilesystemNotas.ts:61-70). The home view (bashhub) thus reads disk through a parallel instance while the editor reads through the singleton adapter. Any layer meant to centralize storage (cache, migration, feature-flag routing) is defeated by paths 2 and 3.
