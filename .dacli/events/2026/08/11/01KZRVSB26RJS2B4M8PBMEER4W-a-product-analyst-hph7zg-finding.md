---
id: 01KZRVSB26RJS2B4M8PBMEER4W
kind: event
event_kind: finding
created: 2026-08-11T16:51:41Z
created_by: a-product-analyst-hph7zg
about: "[[010]]"
origin: agent
applied: false
---
10 new capability proposals, each composing already-built assets (esp. the unused cross-nota block-table queryability)

Each: assets composed / effort band (S<1wk, M~1-3wk, L>3wk) / why it fits the ML-research-notebook identity, NOT generic SaaS. The recurring leverage: 22 typed block tables are individually addressable by notaId+type+order and INDEXED (db.ts:72-95) -- the app can already query across ALL documents at block granularity, and almost nothing uses this.

1. CROSS-NOTA BLOCK SEARCH ('find that code/figure/citation across all my notebooks'). Assets: db.ts typed tables + where('notaId')/type indexes + existing SearchModal.vue. Effort: S-M. Fit: the 4 open TODOs asking for 'block-based content search' (useNotaFiltering.ts:34, useNotaFilters.ts:118) are literally requesting this; a researcher with 50 notebooks needs to find a snippet, not a title. Nearly free given the indexes already exist.

2. PERSONAL REFERENCE LIBRARY (Zotero-lite). Assets: citationBlocks + bibliographyBlocks tables (cross-query), citationStore.ts, useBibTexParser/useBatchBibTexParser, ReferencesSidebarContent.vue. Effort: M. Fit: citations are currently siloed per-nota; a researcher's references are a cross-project asset. Aggregate every citationBlock across notas into one searchable library with dedupe + BibTeX export. Composes existing citation stack, no new domain model.

3. REACTIVATE AI-CHAT-OVER-YOUR-NOTES (RAG-lite). Assets: the ORPHANED AIAssistantSidebar + useAIGeneration + useMentions cross-nota context injection (useMentions.ts:216-260) + conversations table + WebLLM in-browser provider. Effort: S to unblock (add the missing 'activate-ai-assistant' dispatcher / an insertable entry point), M to add real retrieval. Fit: makes the 'AI-native' claim true beyond code; the pipeline is ~complete and stranded (see orphaned finding). Cheapest high-impact win in the repo.

4. RUNNABLE DAG PIPELINES over real code blocks. Assets: pipeline block (Vue Flow, PipelineExtension.ts) + executableCodeBlock + codeExecutionStore.ts session/exec (executeAll:770, shared sessions). Effort: M. Fit: the pipeline block draws DAGs but wire its nodes to actual code blocks and execute in dependency order on the existing kernel -- turns a diagram into a reproducible ML workflow. This is the notebook's differentiator realized.

5. CROSS-EXPERIMENT MODEL LEADERBOARD. Assets: confusionMatrix block (already computes accuracy/precision/recall + has ModelComparisonPanel) + confusionMatrixBlocks table cross-query. Effort: M. Fit: aggregate every confusion-matrix across all notas into one leaderboard/dashboard -- exactly what an ML engineer running many experiments wants. Pure composition of an existing block + a cross-table query; no ML code needed.

6. REPRODUCIBLE PUBLISHED NOTEBOOKS (re-run in the reader's browser). Assets: publishing/bashhub (PublicNotaView.vue, /p/:id) + executableCodeBlock + WebLLM/WebGPU in-browser inference + (optionally) a JS/pyodide kernel. Effort: M-L. Fit: published notas are today static HTML; letting a reader re-execute code or re-run a WebLLM cell in-browser (no server) makes 'publish your research as an interactive page' real. Composes two flagship assets (publishing + in-browser compute) nobody has connected.

7. NOTA KNOWLEDGE GRAPH / BACKLINKS. Assets: subNotaLinkBlocks table (cross-query) + citation graph + Vue Flow (already a dependency). Effort: M. Fit: a 'second brain' for research needs backlinks and a link graph; subNotaLink edges already exist as rows, just unvisualized. Reuse the Vue Flow renderer from the pipeline block.

8. BLOCK-LEVEL VERSION HISTORY / DIFF. Assets: blockStructures already carries indexed version + lastModified fields (db.ts:95) + filesystem .nota-on-disk mode. Effort: M. Fit: local-first + git-friendly is a stated identity; the version field is already persisted but unused for history. Show per-block diffs across saves. (Caveat: filesystem mode is half-wired -- sibling arch findings.)

9. ML-EXPERIMENT NOTA TEMPLATES. Assets: existing blocks (code + pipeline + confusionMatrix + theorem + citation) + NewNotaModal template hook (TODO nota.ts template conversion). Effort: S. Fit: one-click 'new experiment' notebook prewired with a dataset-load code block, a pipeline, a confusion-matrix, and a references section -- packages the product's unique blocks into a workflow. Composition only.

10. OFFLINE CSV->METRICS REPORT. Assets: confusionMatrix block already ingests CSV / Jupyter files (FileUpload + StatsVisualization) + export-to-HTML. Effort: S. Fit: drop predictions.csv, get a shareable metrics report -- a self-contained researcher utility using one existing block end-to-end.

TOP 3 BY value/effort: #3 (unblock stranded AI-chat, S), #1 (cross-nota block search, the TODOs already ask for it, S-M), #5 (cross-experiment leaderboard, uniquely fits ML identity, M).
