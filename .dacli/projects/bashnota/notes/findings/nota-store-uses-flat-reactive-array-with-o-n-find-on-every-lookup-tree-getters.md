---
id: f-nota-store-uses-flat-reactive-array-with-o-n-find-on-every-lookup-tree-getters
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-perf-reviewer-mag58h
about: "[[t-01KZRSX0151GFYPXJNE9M9B86Z]]"
source_event: 01KZRTE80F55MD2402972JAB90
---
# Nota store uses flat reactive array with O(n) .find on every lookup; tree getters are O(n*depth), list rendering O(n^2)
src/features/nota/stores/nota.ts holds all notas in a flat reactive array 'items' and every accessor is a linear scan: getItem (nota.ts:167-169), getCurrentNota (:171-173) each do state.items.find(). Tree-walking getters call find() once per ancestor level: getParents (:149-165) and getRootNotaId (:175-182) recurse doing a fresh O(n) find at every level = O(n*depth). getChildren (:145-146) and rootItems (:133-143) are O(n) filters. These getters run inside list/tree rendering (AppSidebar, breadcrumbs) and in App.vue:79-85 activeNota computed. Rendering a sidebar tree of N notas that calls getItem/getParents per node is O(n^2) per reactive update, and 'items' being deeply reactive means any mutation re-triggers dependent computeds. Fix: maintain an id->nota Map index (or shallowRef + Map) built once and updated on add/remove, turning lookups into O(1) and tree walks into O(depth). Risk: low-moderate (getter call sites unchanged if index is internal).
