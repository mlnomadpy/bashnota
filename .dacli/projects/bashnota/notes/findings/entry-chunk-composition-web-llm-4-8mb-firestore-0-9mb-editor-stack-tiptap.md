---
id: f-entry-chunk-composition-web-llm-4-8mb-firestore-0-9mb-editor-stack-tiptap
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-perf-reviewer-mag58h
about: "[[t-01KZRSX0151GFYPXJNE9M9B86Z]]"
source_event: 01KZRTCXCTXMT5XG3SRAKSWQ83
---
# Entry-chunk composition: web-llm 4.8MB + firestore ~0.9MB + editor stack (tiptap/codemirror/chart/katex/vue-flow) all eager
Byte attribution via generated source map (dist/assets/index-MNUhVMoo.js.map) confirms these packages are in the 10,057KB ENTRY chunk (present in .map sources + measured raw dist size): (1) @mlc-ai/web-llm lib/index.js 5,064,597B ~4.83MB — LAZY-able, only needed when user picks the in-browser WebLLM provider; (2) @firebase/firestore/dist/index.esm2017.js 963,309B raw (tree-shaken subset) — needed for auth/sync but firestore calls could defer; (3) chart.js/dist/chart.js 403,805B — LAZY-able, only used by table-block DataChart.vue:15 + confusion-matrix StatsVisualization.vue:260; (4) katex 276,574B + katex.min.css — LAZY-able, only math-block/subfigure/markdown export; (5) @tiptap (many extensions) — present in ENTRY not just the lazy SplitNotaView chunk; (6) @codemirror present in ENTRY; (7) reka-ui present; (8) @vue-flow present — LAZY-able, only pipeline block; (9) @firebase/auth — eager, required; (10) lucide-vue-next (tree-shaken icons) present. NOT bundled: mathjax (0 map hits), radix-vue (0), d3-scale (0). Root cause the editor stack (tiptap/codemirror/katex/chart/vue-flow) is eager: App.vue:5-24 statically imports CitationPicker, SubNotaDialog, ExportDialog, RightSidebarContainer etc., so opening the '/' home route still downloads the full editor. Trigger to load each lazily: web-llm=select WebLLM provider; chart=open a nota containing a table/chart/confusion-matrix block; katex=render a math block or export; vue-flow=open a pipeline block; tiptap/codemirror=navigate to a nota. Only firebase auth truly needs to be eager.
