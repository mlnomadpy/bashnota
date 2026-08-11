---
id: f-8-largest-files-6-are-decomposition-targets-2-justified
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-code-quality-reviewer-1s4n3a
about: "[[t-01KZRSX02H6GV2QTB510YBAD3D]]"
origin: src/features/editor/components/blocks/pipeline/PipelineNode.vue:1
source_event: 01KZRT5N104832NSN4651JS12V
---
# 8 largest files: 6 are decomposition targets, 2 justified
Analyzed the 8 largest source files (file:line evidence).
DECOMPOSITION TARGETS:
1) src/features/editor/components/blocks/pipeline/PipelineNode.vue:1 (2116 lines) embeds 6+ non-UI concerns inline: pipeline execution engine (handleExecutePipeline 1004, executeSequential 1106, executeParallelWithDependencies 1179, topological sort 1441), kernel/cell execution (executeCodeBlock 1487), context-menu config (435-586), toast/error utils (356-419), keyboard handling (1705). Extract usePipelineExecution/usePipelineKernelExecution.
2) src/features/nota/stores/nota.ts:1 (1480 lines) spans 3 backends: local DB CRUD, file import/export (importNotas 486, clonePublishedNota 1264), remote publishing (publishNota 1013). Extract services + pure serialization helpers (17-101).
3) src/features/editor/components/NotaEditor.vue:1 (1372 lines) conflates editor UI with edit-queue/save pipeline (61-231), duplicated content-load watchers (534-639), code-cell registration (257-330).
4) src/features/bashhub/views/UserPublishedView.vue:1 (1306 lines) god view: stats (482-567), activity heatmap (335-445), pagination (44-120), dual grid/table template (1097-1219). Dead code filteredNotas (156-163).
5) src/features/editor/services/MarkdownParserService.ts:44 (1071 lines) mixes block-pattern config (44-531), parse engine (683-788), Tiptap conversion (822-1040).
6) src/features/nota/stores/blockStore.ts:545 (987 lines) 60pct is two mirror-image switches convertBlockToTiptap (545-784) and importTiptapContent (789-984).
JUSTIFIED: 7) src/features/help/data/helpContent.ts:1 (1168 lines) static markdown content array. 8) src/features/ai/components/components/AIAssistantSidebar.vue:725 template already componentized; only the 720-line script is borderline.
CROSS-CUTTING: Block-to-Tiptap mapping is TRIPLICATED across MarkdownParserService.convertToTiptap (822-1040), blockStore.convertBlockToTiptap (545-784), blockStore.importTiptapContent (789-984).
