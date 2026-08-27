---
id: d-keep-task-005-publishing-firebase-primary-until-dual-reconciliation
kind: note
note_kind: decision
created: 2026-08-14T01:19:14Z
created_by: a-root
about: "[[t-01KZYG4W01FYGE10ZF3X9D5CXD]]"
---
# Keep task-005 publishing Firebase-primary until dual reconciliation
## Chose
Supabase selection requires reconciled auth, explicit C5 build flags, exact counts/IDs/owners/links/metrics, and an independently enabled database marker. Projection polling refreshes content without recording views or exposing base-table migration fields.
## Rejected
Unconditional Supabase publishing cutover or base-table realtime subscription
## Because
Firebase rollback must remain available and base-table payloads contain migration-only fields; refresh must not duplicate view events.
