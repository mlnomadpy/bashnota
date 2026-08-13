---
id: t-01KZS8NMY6M510G07SZP03AG8B
kind: task
created: 2026-08-11T20:36:52Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 6, probable: 10, pessimistic: 20}"
---
# Phase 2: port the 12 custom block nodes onto the pm primitives
## Acceptance
- [x] All 12 Node.create definitions are rewritten with defineNode: citation, confusion-matrix, math, pipeline, subfigure, table-block, theorem, youtube, NotaTitle, PageLink, SubNotaLink, and the duplicate youtube file is resolved with evidence of which was live
- [x] Each ported node has a test asserting its parseDOM/toDOM round-trip preserves every attribute
- [x] npx vue-tsc --build passes, npx vitest run has zero failures, npx vite build succeeds
## Log
- 2026-08-11T20:39:16Z claimed by a-pm-porter-ztd7jc
- 2026-08-13T14:59:20Z accepted by a-root
- 2026-08-13T14:59:20Z verified by `npx vue-tsc --build && npx vitest run && npx vite build` (exit 0)
- 2026-08-13T14:59:20Z deliverable: dacli/003-phase-2-port-the-12-custom-block-nodes-onto-the-pm-primitives exists but is NOT in master — closed anyway
- 2026-08-13T14:59:20Z completed by a-root
