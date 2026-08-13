---
id: t-01KZS8NMZCW2FV9YHNEGF5AXC6
kind: task
created: 2026-08-11T20:36:52Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 3, probable: 5, pessimistic: 10}"
---
# Phase 4: replace the 3 TipTap-coupled third-party packages
## Acceptance
- [x] tiptap-markdown is replaced by prosemirror-markdown used directly, with a serialize/parse round-trip test
- [x] tiptap-unique-id is replaced by a hand-written ProseMirror plugin that assigns stable ids, with a test proving ids survive a document reload
- [x] @rcode-link/tiptap-drawio is replaced by a drawio node built on the pm primitives, or removed with the owner's agreement if the block is unused
- [x] npx vue-tsc --build passes, npx vitest run has zero failures, npx vite build succeeds
## Log
- 2026-08-13T15:45:36Z accepted by a-root
- 2026-08-13T15:45:36Z verified by `npx vue-tsc --build && npx vitest run && npx vite build` (exit 0)
- 2026-08-13T15:45:36Z deliverable: dacli/005-phase-4-replace-the-3-tiptap-coupled-third-party-packages exists but is NOT in master — closed anyway
- 2026-08-13T15:45:36Z completed by a-root
