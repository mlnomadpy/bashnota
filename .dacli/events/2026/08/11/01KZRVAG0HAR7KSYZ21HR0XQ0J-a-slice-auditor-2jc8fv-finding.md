---
id: 01KZRVAG0HAR7KSYZ21HR0XQ0J
kind: event
event_kind: finding
created: 2026-08-11T16:43:35Z
created_by: a-slice-auditor-2jc8fv
about: "[[001]]"
origin: agent
applied: false
---
5 dead files in the nota slice, proven zero-importer repo-wide

Whole-repo grep of src (import.*NAME) returns ZERO import statements for each (only own definition + README mentions): (1) services/subNotaService.ts — its createSubNota (fetchAPI + editor-link variant) is never imported; the live sub-nota path is notaStore.createItem/createSubNota. (2) composables/useSaveHandler.ts — never imported (the editor uses its own debouncedSave). (3) composables/useNotaFiltering.ts — never imported; the live filter composable is the differently-named useNotaFilters.ts. (4) composables/useNotaMetadata.ts — never imported. (5) views/NotaView.vue (211 LOC) — not routed and not imported; router/index.ts:15 routes /nota/:id to SplitNotaView.vue, not NotaView. Confirmed no barrel hides them: the only barrel in the slice is components/references/index.ts, which IS imported. Combined ~600 LOC removable with no behavior change. NOTE NotaView.vue is also the slice's heaviest importer of the editor slice — deleting it also removes several cross-slice edges.
