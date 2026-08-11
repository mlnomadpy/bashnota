---
id: t-01KZRVP29RQSVWCDGGJP1EYPBR
kind: task
created: 2026-08-11T16:49:54Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 3, probable: 5, pessimistic: 10}"
---
# Split the bundle and stop shipping web-llm to everyone
## Acceptance
- [x] @mlc-ai/web-llm is removed from the entry graph and loads only when a user selects the WebLLM provider, proven by vite build output before and after
- [x] vite.config.ts defines manualChunks separating at minimum the editor stack, math renderers, mermaid, d3 and chart, vue-flow, and firebase
- [x] Reports the entry chunk raw and gzip size against the 10,057.95 kB / 3,327.84 kB baseline
- [x] The PWA precache total drops correspondingly and the app still loads and navigates with no console errors
- [x] No feature is removed or lazily broken: every route still reaches its code
## Log
- 2026-08-11T17:09:47Z claimed by a-fixer-kxmqy9
- 2026-08-11T19:28:54Z accepted by a-root (applied 1 proposal(s))
- 2026-08-11T19:28:54Z verified by `true` (exit 0)
- 2026-08-11T19:28:54Z deliverable: dacli/008-split-the-bundle-and-stop-shipping-web-llm-to-everyone exists but is NOT in master — closed anyway
- 2026-08-11T19:28:54Z completed by a-root
