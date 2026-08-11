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
- [ ] Commands.ts, ContextMenu.ts, DragHandle.ts, DragHandlePlugin.ts, MarkdownExtension.ts and SubNotaLinkSlashCommand.ts no longer import @tiptap/*
- [ ] @tiptap/suggestion is replaced by a hand-written ProseMirror suggestion plugin, with tests covering trigger, filter, select and dismiss
- [ ] npx vue-tsc --build passes, npx vitest run has zero failures, npx vite build succeeds
## Log
