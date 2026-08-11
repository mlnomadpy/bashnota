---
id: t-01KZRSX0151GFYPXJNE9M9B86Z
kind: task
created: 2026-08-11T16:18:44Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 2, probable: 4, pessimistic: 8}"
---
# Review: load and runtime performance
## Acceptance
- [x] Names the top 10 contributors to the 10MB main chunk with measured/estimated kB each, identified from the actual import graph not from guesswork
- [x] States for each whether it can be lazy-loaded, and what user action would trigger the load
- [x] Reports at least 5 runtime performance findings (not bundle size) with file:line — e.g. unbounded watchers, O(n^2) list work, missing v-memo/shallowRef on large structures
- [x] Every finding is filed via 'dacli note add finding' with an --origin of file:line
- [x] Ends with a ranked list where each item states: expected kB or ms saved, implementation cost in hours, and risk of breakage
## Log
- 2026-08-11T16:20:15Z claimed by a-perf-reviewer-mag58h
- 2026-08-11T16:37:36Z accepted by a-root (applied 1 proposal(s))
- 2026-08-11T16:37:36Z closed WITHOUT verification — no --verify command was given
- 2026-08-11T16:37:36Z deliverable: no dacli/002-review-load-and-runtime-performance branch — nothing to check against master
- 2026-08-11T16:37:36Z completed by a-root
- 2026-08-11T16:37:41Z finding by a-perf-reviewer-mag58h: web-llm (~4.8MB) eagerly bundled into entry chunk via main.ts store import (event 01KZRT661F9FGFS11KPCVNM6T7)
- 2026-08-11T16:37:41Z finding by a-perf-reviewer-mag58h: No manualChunks/code-splitting config in vite.config.ts: all vendor code collapses into one 10MB entry chunk (event 01KZRT6G8A771RT63H8S1HFSH2)
- 2026-08-11T16:37:41Z finding by a-perf-reviewer-mag58h: Entry-chunk composition: web-llm 4.8MB + firestore ~0.9MB + editor stack (tiptap/codemirror/chart/katex/vue-flow) all eager (event 01KZRTCXCTXMT5XG3SRAKSWQ83)
- 2026-08-11T16:37:41Z finding by a-perf-reviewer-mag58h: Nota store uses flat reactive array with O(n) .find on every lookup; tree getters are O(n*depth), list rendering O(n^2) (event 01KZRTE80F55MD2402972JAB90)
- 2026-08-11T16:37:41Z finding by a-perf-reviewer-mag58h: Hot block getters build debug arrays/objects as logger args that run in production even though the log is a no-op (event 01KZRTH00QMPZ7F9GGEEY3NJR2)
- 2026-08-11T16:37:41Z finding by a-perf-reviewer-mag58h: App.vue wordCount computed rebuilds the entire TipTap document and re-instantiates a composable on every block change (event 01KZRTH68Y5BCTKEA1F5DQ7REB)
- 2026-08-11T16:37:41Z finding by a-perf-reviewer-mag58h: Deep watchers (deep:true) on large output/content structures across editor composables cause O(size) diffing per change (event 01KZRTHFWHAE72J2NJABHK069Z)
- 2026-08-11T16:37:41Z finding by a-perf-reviewer-mag58h: Block store keeps all blocks in a deeply-reactive Pinia Map with no shallowRef/markRaw; large code outputs are fully proxied (event 01KZRTHPASAHCBYGCEAE4WD688)
- 2026-08-11T16:37:41Z finding by a-perf-reviewer-mag58h: AIAssistantSidebar registers onBeforeUnmount after an await, so the 30s provider-check interval (with network calls + console.log) can leak (event 01KZRTK6CPD6FWY5TT9RTCRHC0)
- 2026-08-11T16:37:41Z finding by a-perf-reviewer-mag58h: Ranked load+runtime performance backlog (payoff / cost hrs / breakage risk) (event 01KZRTMGHVMY2KHP3QQY8CKNVD)
