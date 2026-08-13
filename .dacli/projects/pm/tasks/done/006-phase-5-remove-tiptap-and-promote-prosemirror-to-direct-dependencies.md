---
id: t-01KZS8NMZY4NWEV2C2AYFCSVA5
kind: task
created: 2026-08-11T20:36:52Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 8, probable: 13, pessimistic: 21}"
---
# Phase 5: remove TipTap and promote prosemirror to direct dependencies
## Acceptance
- [x] grep -r '@tiptap' src returns nothing
- [x] Every @tiptap package and the 3 TipTap-coupled third-party packages are gone from package.json
- [x] Every prosemirror-* package actually imported is a direct dependency in package.json, not transitive
- [x] A clean npm ci followed by vue-tsc --build, vitest run and vite build all succeed, and the entry chunk is reported against the 1,941,760 byte baseline
## Log
- 2026-08-13T16:31:49Z claimed by a-root
- 2026-08-13T17:17:28Z accepted by a-root
- 2026-08-13T17:17:28Z verified by `cd /Users/tahabsn/Documents/GitHub/bashnota/.dacli/worktrees/pm-006-phase-5-remove-tiptap-and-promote-prosemirror-to-direct-dependencies && ! rg '@tiptap' src package.json package-lock.json && npm ci --offline && npx vue-tsc --build && npx vitest run && npx vite build` (exit 0)
- 2026-08-13T17:17:28Z deliverable: dacli/006-phase-5-remove-tiptap-and-promote-prosemirror-to-direct-dependencies exists but is NOT in master — closed anyway
- 2026-08-13T17:17:28Z completed by a-root
