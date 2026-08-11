---
id: 01KZRVAY5K23G3T1MJB93SBRS5
kind: event
event_kind: finding
created: 2026-08-11T16:43:49Z
created_by: a-slice-auditor-2jc8fv
about: "[[001]]"
origin: agent
applied: false
---
Feature grades for the nota slice (9 capabilities) with file:line

SUB-NOTAS: PARTIAL — create/move work via notaStore.createItem/createSubNota (nota.ts:213/802) reached from NotaTree inline input (AppSidebar.vue:483) and SubNotaManager (RightSidebarContainer.vue:278); but services/subNotaService.ts is DEAD and NewNotaModal's parentId prop (NewNotaModal.vue:181) is never bound so the modal only makes root notas. VERSIONS: STUBBED — UI exists (VersionHistoryDialog) but save/restore capture no content (see separate finding: saveVersion NotaEditor.vue:952 drops content; restoreVersion nota.ts:702 restores metadata only). FAVOURITES(nota flag): PARTIAL — toggle+filter work (nota.ts:374, useNotaFilters.ts:47) but views/FavoritesView.vue is ORPHANED: routed at router index.ts:21 yet nothing navigates to /favorites (AppSidebar activeView='favorites' is an in-sidebar filter, not a route push). FAVOURITE BLOCKS: COMPLETE — favoriteBlocksStore.ts persists to db.favoriteBlocks, wired via BlockCommandMenu.vue:343/NotaTree.vue:101/FavoriteBlocksSidebarContent. REFERENCES: COMPLETE — network-backed (referenceValidationService.ts:133 CrossRef, :218 Semantic Scholar) via ReferencesPreviewTable.vue:59; but single-edit ReferenceEditDialog + useReferenceForm are ORPHANED (never mounted). COMMENTS: COMPLETE — Firestore CRUD (commentService.ts:58-101) mounted in PublicNotaView.vue:685. PUBLISHING: COMPLETE — publishNota/unpublish (nota.ts:1013/1102) via fetchAPI; PublicNotaView routed. IMPORT/EXPORT: COMPLETE for flat (.nota export nota.ts:423 + import 486 reachable from NotaEditMenu/HomeHeader) but exportNotaWithSubNotas/importNotaWithSubNotas (nota.ts:932/958) are DEAD (no UI caller). TAGS: COMPLETE — TagFilter/QuickFilters wired into SearchModal + HomeNotaList via useNotaFilters. SEARCH: PARTIAL — title+tags only; useNotaFilters.ts:118 'TODO: Implement block-based content search'; notaStore.searchNotasByTitle (nota.ts:1254) isn't even used by SearchModal (only by AI mentions).
