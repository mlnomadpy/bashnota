---
id: 01KZRV610898HXR64BA70A1DAG
kind: event
event_kind: finding
created: 2026-08-11T16:41:08Z
created_by: a-slice-auditor-qtj7yr
about: "[[001]]"
origin: agent
applied: false
---
PR #369 filesystem-notas home view: additive, does NOT duplicate existing home logic, but is inert unless filesystem storage mode is on

PR #369 added useFilesystemNotas.ts (173 LOC) plus wiring in HomeView.vue and HomeNotaList.vue. What it does: when useStorageMode().isFilesystemMode is true, it discovers .nota files on disk via FileSystemBackend (useFilesystemNotas.ts:50-85), lets the user pick a directory (selectDirectory, :88, persisted via saveDirectoryHandle), and MERGES filesystem-only notas with the database rootItems for display (HomeView.vue allNotas computed :59-67, via getFilesystemOnlyNotas set-difference on id, useFilesystemNotas.ts:145-148). HomeNotaList tags filesystem-only rows (isFilesystemNota, HomeNotaList.vue:130-145) and passes an is-filesystem-nota marker to NotaTable (:441). Does it duplicate existing home logic? No — it does NOT reimplement the list/search/filter/pagination; those still come from the nota-slice useNotaList inside HomeNotaList. It is a genuinely additive source-merge layer. Caveats worth noting: (1) it is INERT when isFilesystemMode is false — allNotas returns store.rootItems unchanged (HomeView.vue:60-61), and per sibling finding 01KZRT53SP filesystem mode is not safely flippable today, so in the default build this whole path is dark. (2) getFilesystemOnlyNotas de-dupes by id but the merged array then re-runs all nota-slice filtering; correctness depends on filesystem and DB notas sharing the same id space. (3) isFilesystemNota re-derives membership from notaStore.items on every row (HomeNotaList.vue:141) rather than reusing the already-computed filesystemNotas prop — minor redundancy, not a bug.
