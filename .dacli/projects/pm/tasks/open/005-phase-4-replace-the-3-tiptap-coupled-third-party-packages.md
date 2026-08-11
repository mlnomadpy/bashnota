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
- [ ] tiptap-markdown is replaced by prosemirror-markdown used directly, with a serialize/parse round-trip test
- [ ] tiptap-unique-id is replaced by a hand-written ProseMirror plugin that assigns stable ids, with a test proving ids survive a document reload
- [ ] @rcode-link/tiptap-drawio is replaced by a drawio node built on the pm primitives, or removed with the owner's agreement if the block is unused
- [ ] npx vue-tsc --build passes, npx vitest run has zero failures, npx vite build succeeds
## Log
