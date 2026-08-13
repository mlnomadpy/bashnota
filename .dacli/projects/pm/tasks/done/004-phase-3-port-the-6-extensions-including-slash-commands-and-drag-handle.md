---
id: t-01KZS8NMYT02W8RW813GSJJMX9
kind: task
created: 2026-08-11T20:36:52Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 4, probable: 7, pessimistic: 14}"
---
# Phase 3: port the 6 extensions including slash commands and drag handle
## Acceptance
- [x] Commands.ts, ContextMenu.ts, DragHandle.ts, DragHandlePlugin.ts, MarkdownExtension.ts and SubNotaLinkSlashCommand.ts no longer import @tiptap/*
- [x] @tiptap/suggestion is replaced by a hand-written ProseMirror suggestion plugin, with tests covering trigger, filter, select and dismiss
- [x] npx vue-tsc --build passes, npx vitest run has zero failures, npx vite build succeeds
## Log
- 2026-08-11T20:39:16Z claimed by a-pm-porter-6k97gg
- 2026-08-13T14:50:12Z accepted by a-root
- 2026-08-13T14:50:12Z verified by `npx vue-tsc --build && npx vitest run && npx vite build` (exit 0)
- 2026-08-13T14:50:12Z deliverable: dacli/004-phase-3-port-the-6-extensions-including-slash-commands-and-drag-handle exists but is NOT in master — closed anyway
- 2026-08-13T14:50:12Z completed by a-root
