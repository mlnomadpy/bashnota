---
id: t-01KZRTMJ37D9TC5K5CT90RN3F1
kind: task
created: 2026-08-11T16:31:36Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 3, probable: 5, pessimistic: 10}"
---
# Audit the editor slice end to end
## Acceptance
- [x] Produces a file-relation map of src/features/editor: entry points reached by the router or other slices, the import graph between components/composables/services/stores, and every file with zero importers proven by a whole-repo grep
- [x] States in plain prose what the editor slice was designed to be, derived from code and types, and names each place the code contradicts src/features/editor/README.md
- [x] Grades all 14 custom block types complete/partial/stubbed/dead/orphaned with file:line evidence for every grade that is not complete
- [x] Explains how a block round-trips: TipTap node to persisted form and back, naming every transformation step, and states what is lost at each step
- [x] Reports at least 6 defects with file:line and the user-visible consequence of each
- [x] Proposes at least 3 upgrades that are cheap specifically because of how this slice is already built, each naming the existing code it leverages
- [x] Every finding filed via 'dacli note add finding --project editor --about <task>' with a file:line origin
## Log
- 2026-08-11T16:34:47Z claimed by a-slice-auditor-skdc6r
- 2026-08-11T19:45:10Z accepted by a-root (applied 1 proposal(s))
- 2026-08-11T19:45:10Z verified by `grep -rlq t-01KZRTMJ37D9TC5K5CT90RN3F1 .dacli/events` (exit 0)
- 2026-08-11T19:45:10Z deliverable: no dacli/001-audit-the-editor-slice-end-to-end branch — nothing to check against master
- 2026-08-11T19:45:10Z completed by a-root
