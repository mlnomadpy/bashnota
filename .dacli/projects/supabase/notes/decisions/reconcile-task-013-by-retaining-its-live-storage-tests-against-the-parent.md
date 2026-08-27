---
id: d-reconcile-task-013-by-retaining-its-live-storage-tests-against-the-parent
kind: note
note_kind: decision
created: 2026-08-19T12:36:14Z
created_by: a-root
---
# Reconcile task 013 by retaining its live Storage tests against the parent adapter
## Chose
Reconcile task 013 by retaining its live Storage tests against the parent adapter
## Rejected
Force-merge the duplicate trunk-based adapter and storage migration
## Because
The child worktree was based on trunk, while task 010 already has the Supabase-only image adapter and bucket migration. Only the Docker browser-key and real-adapter integration evidence is additive; duplicating runtime code would create conflicting migrations and APIs.
