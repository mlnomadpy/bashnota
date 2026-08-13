---
id: t-01KZY23FPQ17SXDBXK8T79XV6W
kind: task
created: 2026-08-13T17:18:17Z
created_by: a-root
owner: a-root
priority: should
estimate: "{optimistic: 2, probable: 3, pessimistic: 5}"
---
# Recover the ProseMirror cutover entry-bundle regression
## So that
the TipTap removal does not ship a larger application entry payload
## Acceptance
- [x] Reproduce and document the production entry chunk at 1,971,812 bytes versus the 1,941,760-byte pre-cutover baseline, including the modules responsible for the 30,052-byte (+1.55%) increase
- [x] Reduce the entry chunk to at or below 1,941,760 bytes, or record an evidence-backed exception with a stricter lazy-loading budget and no editor behavior regression
- [x] vue-tsc --build, full vitest run, and vite build pass; a clean-install build reports both entry and editor chunk sizes
## Log
- 2026-08-13T17:24:39Z claimed by a-root
- 2026-08-13T18:11:26Z accepted by a-root
- 2026-08-13T18:11:26Z verified by `cd /Users/tahabsn/Documents/GitHub/bashnota/.dacli/worktrees/pm-009-recover-the-prosemirror-cutover-entry-bundle-regression && npm run type-check && npx vitest run && npm run build-only` (exit 0)
- 2026-08-13T18:11:26Z deliverable: dacli/009-recover-the-prosemirror-cutover-entry-bundle-regression exists but is NOT in master — closed anyway
- 2026-08-13T18:11:26Z completed by a-root
