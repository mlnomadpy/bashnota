---
id: d-attributed-bundle-bytes-via-generated-source-map-measured-raw-dist-sizes-not-a
kind: note
note_kind: decision
created: 2026-08-11T16:31:19Z
created_by: a-perf-reviewer-mag58h
about: "[[002]]"
---
# Attributed bundle bytes via generated source map + measured raw dist sizes, not a visualizer plugin
## Chose
Attributed bundle bytes via generated source map + measured raw dist sizes, not a visualizer plugin
## Rejected
Run rollup-plugin-visualizer / a node sourcemap-attribution script for exact per-module bytes
## Because
Grant is read-only and the sandbox blocked writing any script file and running 'node -e' (approval-gated, headless=no approver). I generated real source maps with 'npx vite build --sourcemap' (build artifact, not source), confirmed each package's PRESENCE in the entry chunk via grep of index-*.js.map sources, and sized contributors from measured raw node_modules dist files (web-llm 5.06MB, firestore 963KB, chart.js 404KB, katex 277KB, d3 280KB, dexie 94KB). Tree-shaken libs (tiptap, codemirror, reka-ui, vue-flow, lucide) are labeled ESTIMATED gzip since exact byte attribution needed the blocked script.
