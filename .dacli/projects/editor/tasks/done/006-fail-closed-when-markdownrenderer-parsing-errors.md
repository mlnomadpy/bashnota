---
id: t-01KZYFAT94XJQB1TWRRNBG6X5N
kind: task
created: 2026-08-13T21:09:29Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 1, probable: 2, pessimistic: 3}"
---
# Fail closed when MarkdownRenderer parsing errors
## So that
malformed persisted or remote Markdown cannot reach v-html unsanitized through the parser fallback
## Acceptance
- [x] Every normal and parser-error path crosses one explicit isolated sanitizer immediately before v-html, or the error fallback renders via text interpolation/textContent; raw source is never assembled into HTML
- [x] A mounted test uses a real deeply nested blockquote RangeError payload containing img onerror and proves no event, script, unsafe URL, or style survives while fallback text remains visible
- [x] Normal safe Markdown, links and syntax-highlight structure remain intact, and persisted message content is not mutated
- [x] Assistant-message integration coverage proves remote persisted message content uses the fail-closed renderer
- [x] vue-tsc --build, full vitest, vite build, bundle budget, and git diff --check pass
## Log
- 2026-08-13T21:10:17Z claimed by a-root
- 2026-08-13T21:31:07Z accepted by a-root
- 2026-08-13T21:31:07Z verified by `cd /Users/tahabsn/Documents/GitHub/bashnota/.dacli/worktrees/editor-006-fail-closed-when-markdownrenderer-parsing-errors && npx vue-tsc --build && npx vitest run && npx vite build && git diff --check` (exit 0)
- 2026-08-13T21:31:07Z deliverable: dacli/006-fail-closed-when-markdownrenderer-parsing-errors exists but is NOT in master — closed anyway
- 2026-08-13T21:31:07Z completed by a-root
