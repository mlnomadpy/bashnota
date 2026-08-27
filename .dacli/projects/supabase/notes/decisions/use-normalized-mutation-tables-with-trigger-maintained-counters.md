---
id: d-use-normalized-mutation-tables-with-trigger-maintained-counters
kind: note
note_kind: decision
created: 2026-08-13T22:04:13Z
created_by: a-supabase-implementer-bf1xyk
about: "[[002]]"
---
# Use normalized mutation tables with trigger-maintained counters
## Chose
Use normalized mutation tables with trigger-maintained counters
## Rejected
Store client-supplied vote maps and aggregate counts on published nota/comment rows
## Because
Normalized vote, viewer, event, and aggregate rows let Postgres constraints and fixed-search_path triggers enforce exact transitions without trusting browser-provided counters
