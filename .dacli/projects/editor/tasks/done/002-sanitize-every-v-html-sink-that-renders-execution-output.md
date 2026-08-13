---
id: t-01KZRV1ACEA55QGZ1F9PWFR5CX
kind: task
created: 2026-08-11T16:38:34Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 3, probable: 5, pessimistic: 8}"
---
# Sanitize execution-output HTML bindings
## Acceptance
- [x] The three `v-html` bindings in `OutputRenderer.vue` (`safeFormattedContent`, `safeHighlightedJson`, and `formattedErrorOutput`) pass through DOMPurify, which is already a project dependency
- [x] The misleading safeFormattedContent tag-balance heuristic is replaced by real sanitization, not supplemented by it
- [x] `ErrorDisplay.vue`'s `formattedError` and `CodeBlockOutputView.vue`'s `formattedOutput` computed values return `DOMPurify.sanitize(...)` output to their `v-html` bindings
- [x] Component or helper tests prove that `<script>alert(1)</script>`, an `onerror` attribute, and a `javascript:` URL are neutralized in the OutputRenderer, ErrorDisplay, and CodeBlockOutputView paths
- [x] Tests preserve `<pre><code class="language-python">print(1)</code></pre>` and safe `<strong>` formatting
## Log
- 2026-08-13T14:26:57Z claimed by a-pm-porter-2jkhsb
- 2026-08-13T16:29:29Z accepted by a-root
- 2026-08-13T16:29:29Z verified by `npx vue-tsc --build && npx vitest run && npx vite build` (exit 0)
- 2026-08-13T16:29:29Z deliverable: dacli/002-sanitize-every-v-html-sink-that-renders-execution-output exists but is NOT in master — closed anyway
- 2026-08-13T16:29:29Z completed by a-root
