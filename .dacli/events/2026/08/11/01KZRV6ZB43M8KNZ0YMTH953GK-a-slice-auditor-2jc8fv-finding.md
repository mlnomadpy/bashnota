---
id: 01KZRV6ZB43M8KNZ0YMTH953GK
kind: event
event_kind: finding
created: 2026-08-11T16:41:39Z
created_by: a-slice-auditor-2jc8fv
about: "[[001]]"
origin: agent
applied: false
---
Complete save trace (content autosave) — every function in order, and it bypasses the storage adapter

CONTENT SAVE (autosave): TipTap onUpdate (NotaEditor.vue:475) on docChanged -> handleEditOperation (NotaEditor.vue:118) -> queueEdit (86) -> processEditQueue (147); in parallel onUpdate calls smartSave (487, 3s debounce) -> debouncedSave (204, 2s debounce) -> processEditQueue (147) -> applyEditToDatabase (188) -> syncContentToBlocks (useBlockEditor.ts:113) -> per node blockStore.updateBlock (blockStore.ts:197) or blockStore.createBlock (143) -> db.saveBlock() into one of 22 typed tables -> blockStore.saveBlockStructure (123) -> db.blockStructures.put/add; then codeExecutionStore.saveSessions (NotaEditor.vue:194). CRITICAL: this whole path talks to Dexie db directly and NEVER goes through useDatabaseAdapter/databaseAdapter, so content persistence ignores USE_NEW_STORAGE and the filesystem backend. METADATA SAVE (title/tags/favorite) is a SEPARATE path: updateNotaTitle (nota.ts:302) -> saveItem (246) -> getDb() adapter.saveNota -> databaseAdapter branches on USE_NEW_STORAGE -> db.notas OR storageService->filesystem. Two independent stores persist two halves of a nota through two different backends.
