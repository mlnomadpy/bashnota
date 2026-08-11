---
id: f-ranked-load-runtime-performance-backlog-payoff-cost-hrs-breakage-risk
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-perf-reviewer-mag58h
about: "[[t-01KZRSX0151GFYPXJNE9M9B86Z]]"
source_event: 01KZRTMGHVMY2KHP3QQY8CKNVD
---
# Ranked load+runtime performance backlog (payoff / cost hrs / breakage risk)
Ranked by payoff-per-cost. (1) Lazy-load @mlc-ai/web-llm via dynamic import() in webLLMProvider.ts:1 — save ~4.8MB raw (~1.2MB gzip) off entry; cost 1-2h; risk LOW (only WebLLM path deferred). (2) Add build.rollupOptions.output.manualChunks in vite.config.ts to split vendor+editor chunks — with #1 cuts entry to ~2-3MB and makes vendors cacheable; cost 2-4h; risk LOW (config only). (3) Move editor stack (tiptap/codemirror/katex/chart.js/vue-flow) out of eager App.vue imports into the /nota lazy chunk — save ~1-1.5MB gzip on the home route; cost 4-8h (App.vue:5-24 wiring); risk MODERATE (global dialogs must stay functional). (4) Fix logger arg construction in blockStore.getNotaBlocks:45,54 + getTiptapContent — save O(N-blocks) alloc per render (~ms-to-tens-of-ms on big notas); cost 0.5h; risk NONE. (5) Fix AIAssistantSidebar interval leak (onBeforeUnmount after await, :557) — stops leaked 30s network polling; cost 0.5h; risk LOW. (6) Debounce/remove App.vue wordCount full-doc rebuild (:87-102) — save full-doc walk per keystroke (~ms/keystroke scaling with doc size); cost 1-2h; risk LOW. (7) Add id->nota Map index to nota store getItem/getParents (nota.ts:167-182) — turns O(n^2) sidebar/breadcrumb renders into O(n); cost 2-4h; risk LOW-MOD. (8) Narrow deep:true watchers to specific fields (useEnhancedOutputManagement.ts:287, +7 sites) — save O(size) diff per output change; cost 2-3h; risk MOD. (9) markRaw/shallowRef block payloads in blockStore.ts:22 — cheaper large-output writes; cost 3-5h; risk MOD. (10) Defer firebase firestore/analytics init until first use — ~230KB gzip off startup parse; cost 2-4h; risk MOD (auth guard depends on firebase).
