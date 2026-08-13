---
id: t-01KZYDZS8DSVGRJQ3BYGVE1392
kind: task
created: 2026-08-13T20:45:59Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 1, probable: 2, pessimistic: 3}"
---
# Sanitize rendered theorem statements and proofs without breaking MathJax
## So that
persisted theorem text cannot execute attacker-controlled HTML in statement or proof displays
## Acceptance
- [x] One explicit isolated hook-free sanitizer policy covers both normal MathJax rendering and renderer-error fallback before the MixedContentDisplay v-html sink
- [x] The policy blocks scripts, event attributes, javascript/data URLs, forms, style abuse, foreignObject and unsafe SVG while preserving only the safe MathJax HTML/SVG structure, classes and ARIA required for formulas
- [x] Mounted tests cover theorem statements and proofs in normal and renderer-error paths with onerror, javascript/data, SVG/foreignObject, style and form payloads
- [x] Safe text, paragraph breaks, inline/display math and ordinary formatting survive, while persisted theorem source remains unchanged
- [x] vue-tsc --build, full vitest, vite build, bundle budget, and git diff --check pass
## Log
- 2026-08-13T20:46:39Z claimed by a-root
- 2026-08-13T21:07:09Z accepted by a-root
- 2026-08-13T21:07:09Z verified by `cd /Users/tahabsn/Documents/GitHub/bashnota/.dacli/worktrees/editor-005-sanitize-rendered-theorem-statements-and-proofs-without-breaking-mathjax && npx vue-tsc --build && npx vitest run && npx vite build && git diff --check` (exit 0)
- 2026-08-13T21:07:09Z deliverable: dacli/005-sanitize-rendered-theorem-statements-and-proofs-without-breaking-mathjax exists but is NOT in master — closed anyway
- 2026-08-13T21:07:09Z completed by a-root
