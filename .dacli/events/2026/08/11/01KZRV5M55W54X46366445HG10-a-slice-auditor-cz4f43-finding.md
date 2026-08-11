---
id: 01KZRV5M55W54X46366445HG10
kind: event
event_kind: finding
created: 2026-08-11T16:40:55Z
created_by: a-slice-auditor-cz4f43
about: "[[001]]"
origin: agent
applied: false
---
Block-type grades: 8 complete, 4 partial (table/pipeline/executableCode/confusionMatrix), nota-config & markdown-input are non-node components; none dead/orphaned

All 14 registered in getEditorExtensions (extensions/index.ts). COMPLETE nodes: citation(:138), bibliography(:139), math(:117), nota-title(:145), sub-nota/subNotaLink(:143-144), subfigure(:128), theorem(:140), youtube(:127). PARTIAL: (a) table TableExtension.ts — sole attr tableData has no parseHTML/renderHTML and renderHTML(:60-66) emits an EMPTY div, so table data survives only in ProseMirror JSON, never HTML; (b) pipeline PipelineExtension.ts:34-63 nodes/edges/viewport object attrs, renderHTML(:74-76) spreads them into HTML attrs -> serialize to [object Object]; (c) executable-code ExecutableCodeBlockExtension.ts:10-55 output/kernelName/serverID/sessionId/id have no parseHTML, and parseHTML is inherited from CodeBlock (parses <pre>) while renderHTML emits a div wrapper -> parse/render asymmetry; (d) confusion-matrix ConfusionMatrixBlock.vue:577/616/662 three 'coming soon' toolbar actions. NON-NODE (by design, in use): nota-config (NotaConfigModal.vue, imported by nota slice NotaView.vue:4 / NotaPane.vue:86) and markdown-input (MarkdownInputComponent.vue dialog, NotaEditor.vue:24). No block is dead or orphaned.
