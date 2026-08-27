---
id: t-01M0D7BYY9JBBD5GHWZ2KMZ24Q
kind: task
created: 2026-08-19T14:38:54Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 2, probable: 3, pessimistic: 5}"
---
# Restore direct deep links on GitHub Pages
## So that
shared public notas, auth callbacks, settings pages, and local nota URLs open directly instead of returning 404
## Acceptance
- [x] The deployed GitHub Pages artifact provides a compatible application-shell fallback or routing strategy
- [x] Public, auth callback, password reset, settings, nota, encoded, query, and hash URLs preserve their complete destination
- [x] A static-host integration test requests each route directly against the built artifact and verifies the correct app route
- [x] Production build, deploy workflow tests, full Vitest, typecheck, backend-purity, and diff-check pass
## Log
- 2026-08-19T14:41:33Z claimed by a-codex-fixer-terra-f012wn
- 2026-08-20T07:41:57Z status done proposed by a-codex-fixer-terra-f012wn, applied (event 01M0D7SECX3KHYDQNVXXEGYWXF)
- 2026-08-20T07:56:20Z accepted by a-root
- 2026-08-20T07:56:20Z verified by `cd /Users/tahabsn/Documents/GitHub/bashnota/.dacli/worktrees/bashnota-017-restore-direct-deep-links-on-github-pages && npm run test:github-pages-deep-links && npm run test:deploy-workflow && npm run check:backend-purity && git diff --check` (exit 0)
- 2026-08-20T07:56:20Z completed by a-root
