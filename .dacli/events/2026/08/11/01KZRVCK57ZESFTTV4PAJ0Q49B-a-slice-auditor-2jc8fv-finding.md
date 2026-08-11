---
id: 01KZRVCK57ZESFTTV4PAJ0Q49B
kind: event
event_kind: finding
created: 2026-08-11T16:44:44Z
created_by: a-slice-auditor-2jc8fv
about: "[[001]]"
origin: agent
applied: false
---
File-relation map: entry points, public surface, and cross-slice edges of the nota slice

ENTRY POINTS (router/index.ts, all lazy): /nota/:id -> views/SplitNotaView.vue (:15) -> SplitViewContainer -> NotaPane -> editor/NotaEditor; /favorites -> FavoritesView (:21, orphaned, see finding); /p/:id and /@:userTag/:notaId -> PublicNotaView (:69/:82); catch-all -> components/NotFound (:96). PUBLIC SURFACE (what other slices import FROM nota): stores/nota.ts useNotaStore is by far the most-consumed (editor, bashhub HomeView/HomeNotaList, ai useMentions, settings DataManagementSettings); types/nota.ts + types/blocks.ts (editor, bashhub, src/db.ts, src/lib); stores/blockStore.ts useBlockStore (editor CodeBlockOutputView/ExportDialog); stores/favoriteBlocksStore.ts (editor BlockCommandMenu); composables/useBlockEditor.ts (editor NotaEditor, ai useMentions, App.vue); and a REUSED LIST STACK (useNotaActions/useNotaList/useNotaBatchActions/useNotaImport + SearchInput/QuickFilters/TagFilter/NotaTable/BatchActionsToolbar) that bashhub HomeNotaList consumes wholesale. CROSS-SLICE DEPENDENCIES (nota imports FROM): editor is the heaviest inbound dependency (publishNotaUtilities, PublicNotaView, SplitNotaView, NotaPane, NotaEditMenu, ReferencesSidebarContent citationStore, useReferenceBatchDialog); auth (nota.ts, PublicNotaView, comments, sidebar); jupyter (nota.ts config type, NotaPane); bashhub (statisticsService in nota.ts/VotersList/PublicNotaView). BOUNDARY NOTE: nota and editor form a two-way import cycle (nota imports editor stores; editor imports useNotaStore/useBlockEditor) so the block content model is co-owned across the slice boundary — that is why 'which slice owns content' is genuinely ambiguous. The reusable list stack imported by bashhub is an intended public surface, not a violation.
