---
id: 01KZRV7EXGKZZW51VS48T39FDK
kind: event
event_kind: finding
created: 2026-08-11T16:41:55Z
created_by: a-slice-auditor-2jc8fv
about: "[[001]]"
origin: agent
applied: false
---
Complete load trace (nota open) — every function in order, content sourced entirely from block tables

LOAD: route /nota/:id -> SplitNotaView -> NotaPane -> NotaEditor. Metadata is loaded via notaStore.loadNota (nota.ts:385) -> getDb() adapter.getNota or db.notas.get -> deserializeNota (79) which STRIPS any content field. Content: NotaEditor onMounted (NotaEditor.vue:807) -> await initializeBlocks (809) -> useBlockEditor.initializeBlocks (useBlockEditor.ts:32) -> notaStore.getCurrentNota (nota.ts:171) -> blockStore.loadNotaBlocks (blockStore.ts:321): reads structure via db.blockStructures by blockStructureId (332) or by notaId index (335), reads all blocks via db.getAllBlocksForNota (354) across the 22 tables, indexes them into the in-memory blocks Map (367-372), rebuilds blockOrder if legacy/empty (374-397), stores structure in blockStructures Map (406). If zero blocks -> initializeNotaBlocks creates empty structure (blockStore.ts:421). Rendering: content computed (NotaEditor.vue:237) -> getTiptapContent.value (useBlockEditor.ts:400) -> blockStore.getTiptapContent (blockStore.ts:472) -> convertBlockToTiptap per block (545) -> {type:doc,content:[...]}; watchers at NotaEditor.vue:606/630 push it via editor.commands.setContent (615/643). Nothing in this path ever reads a legacy content string off the notas row.
