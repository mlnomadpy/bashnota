---
id: 01KZRT4FT0ZXSCYHXA35A5WR3Q
kind: event
event_kind: finding
created: 2026-08-11T16:22:49Z
created_by: a-architecture-reviewer-yksca5
about: "[[t-01KZRSX01WV40GJGSSYCFMBS7Y]]"
origin: src/services/storageService.ts:21
applied: true
---
New storage abstraction covers only whole-nota CRUD; 25 of 26 Dexie tables have no filesystem path

The IStorageBackend interface (src/services/storageService.ts:21-34) and DatabaseAdapter (src/services/databaseAdapter.ts:23-72) expose only readNota/writeNota/deleteNota/listNotas/writeMany — five whole-nota operations. But src/db.ts:31-96 defines 26 Dexie tables: notas, favoriteBlocks, conversations, 22 block-type tables (textBlocks..subNotaLinkBlocks), and blockStructures. Only `notas` has a filesystem equivalent. FileSystemBackend stores each nota as a single JSON .nota file (src/services/fileSystemBackend.ts:4,14). Consequence: when the filesystem backend is active, favorites (favoriteBlocksStore.ts:2), AI conversations (aiConversationStore.ts:4), and the block-structure tables remain in IndexedDB, so no single storage mode is authoritative for all data.
