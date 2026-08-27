---
id: f-initialized-indexeddb-storage-adapter-collapses-list-failures-to-empty-success
kind: note
note_kind: finding
created: 2026-08-26T22:38:28Z
created_by: a-root
about: "[[041]]"
severity: major
---
# Initialized IndexedDB storage adapter collapses list failures to empty success
Independent review reproduced the uncovered route at src/services/storageService.ts:149-157: IndexedDBBackend.listNotas catches db.notas.toArray rejection and returns []. DatabaseAdapter.getAllNotas then resolves [], so plural useNotaStore.loadNotas replaces last-known-good items and HomeView clears its alert. Repair will propagate a typed actionable IndexedDB library-read error and cover the real DatabaseAdapter -> initialized StorageService -> IndexedDBBackend chain.
