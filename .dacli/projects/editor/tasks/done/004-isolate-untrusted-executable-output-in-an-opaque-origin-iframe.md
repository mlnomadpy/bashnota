---
id: t-01KZYD08S0RT2AQ9TJ8ERSJRWQ
kind: task
created: 2026-08-13T20:28:46Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 2, probable: 4, pessimistic: 8}"
---
# Isolate untrusted executable output in an opaque-origin iframe
## So that
persisted or published code output cannot execute with the application's origin or access parent credentials and DOM
## Acceptance
- [x] Untrusted output iframe never combines allow-scripts with allow-same-origin and therefore has an opaque origin
- [x] Safe HTML output remains renderable using srcdoc or an equivalent mechanism that does not require parent-side contentDocument writes into a same-origin frame
- [x] All iframe-to-parent messages, including resize, validate event.source, expected message shape, and bounded numeric values before changing UI state
- [x] Mounted or browser integration tests prove hostile output cannot read parent.localStorage, access parent DOM, or invoke parent APIs, while safe HTML and intended isolated scripts still render
- [x] Published nota and persisted executable-output paths use the isolated renderer without post-sanitization concatenation or a same-origin fallback
- [x] vue-tsc --build, full vitest, vite build, bundle budget, and git diff --check pass
## Log
- 2026-08-13T20:45:39Z accepted by a-root
- 2026-08-13T20:45:39Z verified by `cd /Users/tahabsn/Documents/GitHub/bashnota/.dacli/worktrees/editor-004-isolate-untrusted-executable-output-in-an-opaque-origin-iframe && npx vue-tsc --build && npx vitest run && npx vite build && git diff --check` (exit 0)
- 2026-08-13T20:45:39Z deliverable: dacli/004-isolate-untrusted-executable-output-in-an-opaque-origin-iframe exists but is NOT in master — closed anyway
- 2026-08-13T20:45:39Z completed by a-root
