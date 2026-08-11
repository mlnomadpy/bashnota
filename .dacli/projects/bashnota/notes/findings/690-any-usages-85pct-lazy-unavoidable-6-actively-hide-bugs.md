---
id: f-690-any-usages-85pct-lazy-unavoidable-6-actively-hide-bugs
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-code-quality-reviewer-1s4n3a
about: "[[t-01KZRSX02H6GV2QTB510YBAD3D]]"
origin: src/features/editor/services/MarkdownParserService.ts:868
source_event: 01KZRTPHJRNRBHJ04ZGC7YS3GG
---
# 690+ 'any' usages: ~85pct lazy/unavoidable, ~6 actively hide bugs
Classified a ~40-usage sample of the ~768 'any' occurrences (499 ': any' annotations, 191 'as any' casts, 63 'any[]', 44 Record<string,any>).
CLASSIFICATION: ~14 UNAVOIDABLE (external boundaries: Jupyter REST JSON, JSON.parse of imported .nota data, File System Access API 'window as any .showDirectoryPicker' at StorageModeSettings.vue:70, navigator.deviceMemory at WebLLMProviderSettingsContent.vue:648, performance.memory at SystemInfoSettings.vue:68, katex). ~20 LAZY-BUT-HARMLESS (field names correct, guarded by '|| default' or 'instanceof Error'; e.g. the ~40 '(block as any).field' casts in blockStore convertBlockToTiptap defeat the discriminated union but names match). ~6 ACTIVELY HIDE A BUG.
BUG-HIDING EXAMPLES (all verified):
1) src/features/editor/services/MarkdownParserService.ts:868-876 — convertToTiptap returns any[], so malformed notaTable flows unchecked: table 'rows' cells map is keyed by header TITLE (line 872) but columns get generated ids (864) and ALL consumers read row.cells[column.id] (TableContent.vue:76/141/163, NotaContentViewer.vue:134, exportService.ts:244). Every imported markdown table renders/exports with empty data cells.
2) src/features/nota/stores/blockStore.ts:834 (also 816,871,877) — importTiptapContent(tiptapContent: any) reads only node.content?.[0]?.text, so .nota re-import truncates multi-run paragraphs to the first run and drops bold/link marks.
3) src/features/jupyter/services/jupyterService.ts:593 — (session: any) derefs session.kernel.id with kernel typed non-optional; a dead/null kernel throws TypeError and rejects the ENTIRE getActiveSessions list.
4) src/services/codeExecutionService.ts:157,170 — msg = JSON.parse(event.data) is any; ws.onmessage has no try/catch, so a kernel message missing content.data or content.traceback throws uncaught, leaving the cell 'executing' forever.
5) src/features/nota/stores/blockStore.ts:761-762 — '(block as any).title'/'.theme' read fields absent from the MermaidBlock type (theme lives under config.theme); the cast hides that they are always undefined, silently dropping mermaid theme on export.
6) src/features/nota/stores/blockStore.ts:704-717 — executableCodeBlock convertBlockToTiptap omits the 'id' attr; codeExecutionStore.registerCodeCells (414-417) dedupes by attrs.id, so multiple exec blocks collapse to one null-keyed runnable cell.
