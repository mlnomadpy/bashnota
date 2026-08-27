---
id: f-interrupted-published-image-deletion-claims-cannot-be-retried
kind: note
note_kind: finding
created: 2026-08-27T11:11:01Z
created_by: a-root
about: "[[bashnota/047-validate-uploaded-image-bytes-and-complete-the-image-lifecycle]]"
severity: moderate
origin: supabase/functions/published-images/index.ts:70
---
# Interrupted published-image deletion claims cannot be retried
Independent exact-head review at 23574a4 reproduced that a stale non-null deleting_at marker is excluded by both bounded cleanup and claim RPC, stranding unreferenced Storage/registry state after worker interruption. Repair requires a bounded lease, atomic stale still-unreferenced reclaim, idempotent retry, and interruption tests.
