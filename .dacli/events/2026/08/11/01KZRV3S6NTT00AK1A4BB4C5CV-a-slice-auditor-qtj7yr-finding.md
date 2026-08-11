---
id: 01KZRV3S6NTT00AK1A4BB4C5CV
kind: event
event_kind: finding
created: 2026-08-11T16:39:55Z
created_by: a-slice-auditor-qtj7yr
about: "[[001]]"
origin: agent
applied: false
---
Dead code inside bashhub: two unused computeds and one unused exported composable method

Three leaves nothing reaches (verified by grep showing only the definition site): (1) UserPublishedView.vue:156-163 'filteredNotas' computed is never referenced in the template or script — its search-filter logic is duplicated inline in processedNotas (UserPublishedView.vue:303-305). (2) HomeView.vue:56 'hasNotas' computed is defined but never used in template or script. (3) useFilesystemNotas.ts:151-154 'getSharedNotas' is implemented and exported (:171) but has zero consumers repo-wide (only getFilesystemOnlyNotas is used, in HomeView.vue:65). All three are safe deletions; they add reading overhead in the slice's two largest files.
