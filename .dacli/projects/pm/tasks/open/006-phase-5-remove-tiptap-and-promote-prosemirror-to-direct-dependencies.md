---
id: t-01KZS8NMZY4NWEV2C2AYFCSVA5
kind: task
created: 2026-08-11T20:36:52Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 2, probable: 3, pessimistic: 6}"
---
# Phase 5: remove TipTap and promote prosemirror to direct dependencies
## Acceptance
- [ ] grep -r '@tiptap' src returns nothing
- [ ] Every @tiptap package and the 3 TipTap-coupled third-party packages are gone from package.json
- [ ] Every prosemirror-* package actually imported is a direct dependency in package.json, not transitive
- [ ] A clean npm ci followed by vue-tsc --build, vitest run and vite build all succeed, and the entry chunk is reported against the 1,941,760 byte baseline
## Log
