---
id: t-01KZY8G40MPAXVFARDB07CRRKX
kind: task
created: 2026-08-13T19:10:03Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 3, probable: 5, pessimistic: 8}"
---
# Make version history snapshot and restore canonical nota content
## So that
restoring a saved version reliably returns both metadata and document body to the selected historical state
## Acceptance
- [x] Saving a version snapshots the canonical normalized block content and block order together with nota metadata; editor.getJSON output is not discarded or stored in a second divergent format
- [x] Restoring a version atomically replaces metadata, canonical blocks, and block order, then reloads as the saved body after a fresh store read
- [x] Integration tests prove body A plus metadata A can be saved, edited to B, restored, and reloaded as A; multiple block types and ordering are retained
- [x] Failure during snapshot or restore leaves the current nota metadata/body and version history intact, with an actionable surfaced error rather than partial state
- [x] Existing legacy metadata-only versions remain readable with an explicit non-destructive compatibility behavior
- [x] vue-tsc --build, full vitest, vite build, and git diff --check pass
## Log
- 2026-08-13T19:10:59Z claimed by a-root
- 2026-08-13T19:33:53Z accepted by a-root
- 2026-08-13T19:33:53Z verified by `cd /Users/tahabsn/Documents/GitHub/bashnota/.dacli/worktrees/nota-002-make-version-history-snapshot-and-restore-canonical-nota-content && npx vue-tsc --build && npx vitest run && npx vite build && git diff --check` (exit 0)
- 2026-08-13T19:33:53Z deliverable: dacli/002-make-version-history-snapshot-and-restore-canonical-nota-content exists but is NOT in master — closed anyway
- 2026-08-13T19:33:53Z completed by a-root
