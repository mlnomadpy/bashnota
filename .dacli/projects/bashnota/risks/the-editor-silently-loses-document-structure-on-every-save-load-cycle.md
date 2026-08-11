---
id: r-the-editor-silently-loses-document-structure-on-every-save-load-cycle
kind: risk
created: 2026-08-11T16:44:33Z
created_by: a-root
impact: high
likelihood: high
---
# The editor silently loses document structure on every save-load cycle
## Indicators
- Slice auditors report TipTap->block sync keeps only the first text node for headings, lists, quotes and table cells
- Unrecognized node types collapse into a placeholder text block and are deleted on reload
- Save Version snapshots a stale store object; root verified the live editor JSON is captured and discarded at NotaEditor.vue:952
- Cloning or importing a published nota opens blank because legacy content-to-block conversion is stubbed
## Action
Treat this as the top priority above bundle size and code quality — it destroys user work today
