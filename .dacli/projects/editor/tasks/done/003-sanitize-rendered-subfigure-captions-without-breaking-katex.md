---
id: t-01KZYBTHG29VKX8WR0Q115W3JN
kind: task
created: 2026-08-13T20:08:10Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 1, probable: 2, pessimistic: 3}"
---
# Sanitize rendered subfigure captions without breaking KaTeX
## So that
persisted captions cannot execute attacker-controlled HTML when a subfigure is viewed
## Acceptance
- [x] Both editable and read-only caption v-html sinks consume one explicit hook-free DOMPurify policy applied after KaTeX rendering
- [x] The policy blocks scripts, event attributes, javascript/data URLs, SVG, MathML, forms, style and embedded content while preserving the safe tags/classes/ARIA required by rendered KaTeX and ordinary caption formatting
- [x] Mounted tests cover both sinks with img/onerror, javascript link, SVG/data/style payloads and prove safe math plus strong/emphasis formatting survives
- [x] Caption persistence and round-trip data remain unchanged; sanitization occurs only at the rendering boundary
- [x] vue-tsc --build, full vitest, vite build, bundle budget, and git diff --check pass
## Log
- 2026-08-13T20:08:54Z claimed by a-root
- 2026-08-13T20:23:49Z accepted by a-root
- 2026-08-13T20:23:49Z verified by `cd /Users/tahabsn/Documents/GitHub/bashnota/.dacli/worktrees/editor-003-sanitize-rendered-subfigure-captions-without-breaking-katex && npx vue-tsc --build && npx vitest run && npx vite build && git diff --check` (exit 0)
- 2026-08-13T20:23:49Z deliverable: dacli/003-sanitize-rendered-subfigure-captions-without-breaking-katex exists but is NOT in master — closed anyway
- 2026-08-13T20:23:49Z completed by a-root
