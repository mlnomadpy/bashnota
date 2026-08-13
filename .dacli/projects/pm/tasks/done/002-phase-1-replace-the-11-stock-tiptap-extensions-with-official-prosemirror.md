---
id: t-01KZS8NMXFPC89BVEGW7QK31P9
kind: task
created: 2026-08-11T20:36:52Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 3, probable: 5, pessimistic: 10}"
---
# Phase 1: replace the 11 stock TipTap extensions with official ProseMirror packages
## Acceptance
- [x] StarterKit, extension-blockquote, extension-code-block, extension-horizontal-rule, extension-link, extension-image, extension-placeholder and the four extension-table packages are no longer imported anywhere in src
- [x] Their behaviour is provided by prosemirror-schema-basic, prosemirror-schema-list, prosemirror-tables, prosemirror-history, prosemirror-dropcursor, prosemirror-gapcursor, prosemirror-commands, prosemirror-keymap and prosemirror-inputrules
- [x] placeholder and task-list/task-item, which have no ProseMirror equivalent, are hand-written and unit-tested
- [x] npx vue-tsc --build passes, npx vitest run has zero failures, npx vite build succeeds, and find src -name '*.js' returns nothing
## Log
- 2026-08-13T15:58:40Z accepted by a-root
- 2026-08-13T15:58:40Z verified by `npx vue-tsc --build && npx vitest run && npx vite build` (exit 0)
- 2026-08-13T15:58:40Z deliverable: dacli/002-phase-1-replace-the-11-stock-tiptap-extensions-with-official-prosemirror exists but is NOT in master — closed anyway
- 2026-08-13T15:58:40Z completed by a-root
