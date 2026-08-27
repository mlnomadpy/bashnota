---
id: t-01M0D7EYH7RB2VXFDN6RPQS6NM
kind: task
created: 2026-08-19T14:40:32Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 2, probable: 3, pessimistic: 5}"
---
# Harden generated HTML exports and execution-output classes
## So that
opening an exported nota or rendering execution output cannot execute stored content or impersonate application UI
## Acceptance
- [x] No persisted title, proof, pipeline, citation, code output, URL, or body value reaches export string interpolation or innerHTML without context-safe construction
- [x] Generated HTML crosses one explicit final allowlist sanitizer and URL policy; citation tooltips use DOM/text APIs
- [x] Execution-output class values are restricted to inert syntax, ANSI, and table vocabularies
- [x] Real-browser tests open malicious exports covering title breakout, script/events, SVG, unsafe URLs, citation/output payloads, and overlay classes and prove no execution, navigation, fetch, or UI overlay
- [x] Safe math, citations, tables, images, links, recursive export, full tests, typecheck, build, bundle budget, and diff-check pass
## Log
- 2026-08-19T14:41:32Z claimed by a-security-fixer-mg37fd
- 2026-08-20T08:40:40Z accepted by a-root
- 2026-08-20T08:40:40Z verified by `cd /Users/tahabsn/Documents/GitHub/bashnota/.dacli/worktrees/bashnota-019-harden-generated-html-exports-and-execution-output-classes && npm run type-check && npx vitest run src/features/editor/services/export src/features/editor/services/__tests__/exportService.test.ts && npm run test:export-security && git diff --check master...HEAD` (exit 0)
- 2026-08-20T08:40:40Z completed by a-root
