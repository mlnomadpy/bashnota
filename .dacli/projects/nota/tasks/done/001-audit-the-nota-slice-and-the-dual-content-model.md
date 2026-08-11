---
id: t-01KZRTMJ3Z4EVQHX8779GBNEP6
kind: task
created: 2026-08-11T16:31:36Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 3, probable: 5, pessimistic: 10}"
---
# Audit the nota slice and the dual content model
## Acceptance
- [x] Produces a file-relation map of src/features/nota with entry points, import graph, and zero-importer files proven by grep
- [x] Answers definitively which content representation is authoritative at runtime: Nota.content TipTap JSON or the 22 normalized Dexie block tables, with the file:line that decides it
- [x] States what blockStore.ts actually does today versus what it was built to do, and whether anything user-facing depends on it
- [x] Traces one complete save and one complete load, naming every function called in order with file:line
- [x] Grades every nota capability complete/partial/stubbed/dead/orphaned: sub-notas, versions, favourites, references, comments, publishing, import/export, tags, search
- [x] Reports at least 6 defects with file:line and user-visible consequence
- [x] Every finding filed via 'dacli note add finding --project nota --about <task>' with a file:line origin
## Log
- 2026-08-11T16:34:47Z claimed by a-slice-auditor-jy2t90
- 2026-08-11T19:45:11Z accepted by a-root (applied 1 proposal(s))
- 2026-08-11T19:45:11Z verified by `grep -rlq t-01KZRTMJ3Z4EVQHX8779GBNEP6 .dacli/events` (exit 0)
- 2026-08-11T19:45:11Z deliverable: no dacli/001-audit-the-nota-slice-and-the-dual-content-model branch — nothing to check against master
- 2026-08-11T19:45:11Z completed by a-root
- 2026-08-11T19:45:21Z a-verifier-9kayw7: verify-verdict: confirmed — claude-ro (a-verifier-9kayw7) on claim: In NotaEditor.vue saveVersion(), the value returned by editor.getJSON() is assigned to a local named content and then never used; the version snapshot is built from currentNota.value instead, so saved versions do not contain the live editor document and restoring a version cannot return the user's work. — saveversion() drops editor.getjson() and snapshots stale currentnota; blocks never captured, restore never re-applies (event 01KZS5KV1N24W3GV205KBXYYG7)
- 2026-08-11T19:45:21Z a-verifier-6ngcyj: verify-verdict: confirmed — claude-ro2 (a-verifier-6ngcyj) on claim: In NotaEditor.vue saveVersion(), the value returned by editor.getJSON() is assigned to a local named content and then never used; the version snapshot is built from currentNota.value instead, so saved versions do not contain the live editor document and restoring a version cannot return the user's work. — saveversion's editor.getjson() is dead; snapshot is spread of currentnota, which lacks the block-stored live doc (event 01KZS5PDPF13Q76QR3SBZXVZZ3)
