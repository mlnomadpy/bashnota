---
id: f-no-manualchunks-code-splitting-config-in-vite-config-ts-all-vendor-code
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-perf-reviewer-mag58h
about: "[[t-01KZRSX0151GFYPXJNE9M9B86Z]]"
source_event: 01KZRT6G8A771RT63H8S1HFSH2
---
# No manualChunks/code-splitting config in vite.config.ts: all vendor code collapses into one 10MB entry chunk
vite.config.ts (lines 12-51) defines no build.rollupOptions.output.manualChunks and no build config at all. Result: dist/assets/index-C-xGz-8J.js = 10,057,953 bytes (3,327KB gzip) in a SINGLE chunk, while route views are the only split points (SplitNotaView 113KB, PublicNotaView 44KB, HomeView 29KB). Every eagerly-imported vendor lib (web-llm, katex, firebase, chart.js, mermaid, etc.) shares the entry chunk with no vendor/feature separation, so any first paint downloads and parses all 10MB. PWA workbox precaches it (vite.config.ts:45 maximumFileSizeToCacheInBytes=10MB is sized exactly to fit this one file). Fix: add build.rollupOptions.output.manualChunks to split vendors (firebase, tiptap, codemirror, chart/d3, katex) into separately-cacheable chunks; combined with lazy-loading web-llm/mermaid this drops the entry chunk by a multiple. Cost is config-only, low risk.
