---
id: 01KZRVC3XNK3HP275S3A3Z3Y56
kind: event
event_kind: finding
created: 2026-08-11T16:44:28Z
created_by: a-slice-auditor-cz4f43
about: "[[001]]"
origin: agent
applied: false
---
HTML export: pipeline lost to a placeholder, drawio & mermaid handlers are dead code, confusion-matrix stats dropped, theorem LaTeX not rendered

exportService.ts degradations: (1) pipeline -> 'Pipeline Visualization (Interactive Only)' placeholder (:288-294); all nodes/edges discarded. (2) drawio placeholder branch (:255-257) is DEAD: the @rcode-link/tiptap-drawio node extends Image with no custom renderHTML, so it emits <img data:image/png> and exports as a static PNG via processAssets, never hitting the .drawio-diagram selector. (3) mermaid handler (:323-326) is DEAD: no mermaid node is registered in getEditorExtensions() (index.ts:64-146); mermaid exists only as a fenced-code language in MarkdownParserService.ts:327. (4) confusionMatrix export (:260-285) reads only data-matrix/data-labels/data-title and IGNORES data-stats/data-source/data-file-path (ConfusionMatrixExtension.ts:79-110). (5) theorem content is inserted via textContent (:212) with an in-code comment (:206-211) admitting body LaTeX/markdown is not rendered. Also processAssets+processCustomBlocks run twice (:67-70), redundant. USER-VISIBLE: pipelines, and rich theorem bodies, degrade or vanish in exported HTML.
