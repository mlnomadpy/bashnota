---
id: 01KZRVFCH12J34ZT5QXRTJFCNC
kind: event
event_kind: finding
created: 2026-08-11T16:46:15Z
created_by: a-slice-auditor-cz4f43
about: "[[001]]"
origin: agent
applied: false
---
Editor slice file-relation map: entry points (public surface) and cross-slice edges

ENTRY POINTS reached from OUTSIDE the slice: router -> views/CodeBlockOutputView.vue (router/index.ts:44). Main components NotaEditor.vue and NotaContentViewer.vue <- nota slice (NotaView.vue:2, NotaPane.vue:111, PublicNotaView.vue:11). Public stores consumed cross-slice: editorStore (App.vue:16, NotaPane, SplitNotaView), codeExecutionStore (NotaView:9, NotaPane:108), citationStore (nota references components), tableStore (publishNotaUtilities.ts:4), aiActionsStore (settings/* + components/CodeAction*). Extension registry components/extensions/index.ts <- src/lib/markdownToTiptap.ts:2. Dialogs ExportDialog/PublishNotaModal, CitationPicker, SubNotaDialog <- App.vue. nota-config/NotaConfigModal <- nota slice; ServerListItem <- settings JupyterSettings. CROSS-SLICE EDGES (editor importing other slices): editor->nota is the dominant coupling (MarkdownParserService, NotaEditor, ExportDialog, codeExecutionStore, citationStore, all citation-block files, nota-config, sub-nota, nota-title -> nota/stores/nota|blockStore|types). editor->jupyter is the second hub, centered on codeExecutionStore.ts:4/6/8 and the executable-code + confusion-matrix + pipeline blocks. editor->ai is light (aiActionsStore.ts:3 -> ai/services/aiService; BlockCommandMenu.vue:26-28). NO edges to settings or bashhub. HUBS: codeExecutionStore (nota+jupyter), useBlockEditor seam (nota). Full grep evidence in the import-graph analysis. Note a same-name collision: editor's own stores/aiActionsStore.ts vs ai/stores/aiActionsStore (already filed by vue-reviewer as duplicate Pinia id aiActions).
