---
id: f-feature-inventory-30-user-reachable-capabilities-graded-with-the-block-palette
kind: note
note_kind: finding
created: 2026-08-11T19:45:21Z
created_by: a-product-analyst-hph7zg
about: "[[t-01KZRTSZTTP1YCS6BPXZ1ABGYR]]"
source_event: 01KZRVP3CGGP5M3C2H51CP58C2
---
# Feature inventory: 30+ user-reachable capabilities graded, with the block palette and publishing complete, AI-chat orphaned
Grades: complete/partial/stubbed/dead/orphaned. file:line evidence.

AUTHORING / BLOCKS (the core):
- Block persistence via 22 typed Dexie tables + blockStructures = AUTHORITATIVE local store: COMPLETE. blockStore.ts writes db.saveBlock/blockStructures.put (blockStore.ts:131,164,233), editor reads only from blocks (NotaEditor.vue:237-254), Nota has no persisted 'content' field (nota/types/nota.ts:4-21; deserialize comment nota.ts:81). content is derived on-demand for export/publish only.
- Executable code block (Jupyter): COMPLETE. Slash 'Code Block' maps to executableCodeBlock (ExecutableCodeBlockExtension.ts:6-7, suggestion.ts:386). WebSocket kernel exec codeExecutionService.ts:126-201.
- Math (KaTeX): COMPLETE (math-extension.ts:21, suggestion.ts:421). Theorem: COMPLETE (theorem-extension.ts:27, suggestion.ts:438). Subfigure: COMPLETE (subfigure-extension.ts:66). Confusion matrix (ML stats): COMPLETE (ConfusionMatrixExtension.ts:27, suggestion.ts:559). Pipeline (Vue Flow DAG): COMPLETE (PipelineExtension.ts:29, suggestion.ts:612). notaTable/DB table: COMPLETE (suggestion.ts:548). drawio: COMPLETE. youtube: COMPLETE. citation+bibliography: COMPLETE (CitationExtension.ts:11,121). subNotaLink: COMPLETE. StarterKit primitives: COMPLETE.
- Mermaid block: STUBBED/DEAD. Slash entry exists (suggestion.ts:581) but command body only deletes the range and inserts nothing (suggestion.ts:589-593); no Mermaid TipTap node registered. Mermaid only lives in export/markdown services.
- aiGeneration block: ORPHANED. Type in blocks.ts:171 + Dexie table db.ts:52, but NO TipTap node; 'AI Assistant' slash item only toggles a sidebar (suggestion.ts:654).

CODE EXECUTION / JUPYTER: connect server, pick kernel, browse files, WebSocket exec, streamed output, session persistence: COMPLETE (jupyterService.ts, codeExecutionStore.ts:525-770, codeExecutionService.ts). jupyterService.executeCode:383 is a redundant legacy executor.

AI: text actions (rewrite/grammar/summarize/translate) via block command menu COMPLETE (aiActions.ts:19, BlockCommandMenu.vue:433). Code AI (explain/optimize/refactor/tests/security/fix-error) in code-block output panel COMPLETE (editor/stores/aiActionsStore.ts:171-382, OutputSection.vue:221). Providers Gemini/Ollama/WebLLM(in-browser WebGPU) COMPLETE (providerFactory.ts:70). Standalone AI chat sidebar + conversation persistence: ORPHANED (see separate finding). Embeddings/semantic search/whole-nota generation: ABSENT.

PUBLISHING / BASHHUB: publish/unpublish (nota.ts:1013,1102), public pages /p/:id & /@:userTag (router:67,80, PublicNotaView.vue), user profiles (UserPublishedView.vue), votes (PublicNotaView.vue:389), threaded comments (functions/routes/comments.ts), view stats (statisticsService.ts:17), clone published nota (nota.ts:1264): COMPLETE. Firebase functions Express API COMPLETE (functions/src/index.ts). statisticsService.getUserNotasStatistics:417 STUBBED (returns []).

EXPORT/IMPORT: export .nota + HTML/zip + Markdown COMPLETE (ExportDialog.vue, exportService.ts:33); PDF STUBBED ('Coming soon', ExportDialog.vue:76-90); ipynb export ABSENT. Import .nota + .ipynb COMPLETE (useNotaImport.ts:34,83); markdown/HTML import ABSENT.

CITATIONS: manager, picker, BibTeX import (batch), auto-bibliography, references sidebar: COMPLETE (citationStore.ts, useBibTexParser.ts, ReferencesSidebarContent.vue).

AUTH: login/register/profile, userTag system: COMPLETE (auth feature, router:49-64).

NAV/LAYOUT: split-view, tabs, sidebars, favorites-filter: COMPLETE but DUPLICATED across two nav stacks (see sibling arch findings). clone-published->blocks conversion STUBBED (nota.ts:1319/1379/1439 TODOs).
