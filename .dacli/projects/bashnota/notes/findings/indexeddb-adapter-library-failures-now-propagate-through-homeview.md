---
id: f-indexeddb-adapter-library-failures-now-propagate-through-homeview
kind: note
note_kind: finding
created: 2026-08-26T22:41:33Z
created_by: a-root
about: "[[041]]"
severity: major
---
# IndexedDB adapter library failures now propagate through HomeView
Repair: src/services/storageService.ts:22-37 defines typed actionable StorageReadError; IndexedDBBackend.listNotas at lines 170-177 now throws it instead of returning false empty success. HomeView.indexedDBFailure.integration.test.ts:53-117 initializes the real StorageService indexeddb backend, installs a real DatabaseAdapter, injects Dexie toArray failure, and proves NotaLoadError cause typing, prior-item retention, visible role=alert, retained list count, and retry. Filesystem and singular loadNota paths are unchanged. Gates: focused 35/35, type-check, full Vitest 525 passed/1 skipped, build, backend purity, repository hygiene, diff-check.
