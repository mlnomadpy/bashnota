---
id: d-use-firebase-primary-shadowing-a-maintenance-freeze-then-a-seven-day-rollback
kind: note
note_kind: decision
created: 2026-08-13T21:45:31Z
created_by: a-supabase-implementer-5jrb3a
about: "[[001]]"
---
# Use Firebase-primary shadowing, a maintenance freeze, then a seven-day rollback mirror
## Chose
Use Firebase-primary shadowing, a maintenance freeze, then a seven-day rollback mirror
## Rejected
One-shot big-bang cutover or indefinite bidirectional multi-master writes
## Because
A single authoritative store per phase plus an idempotent durable journal makes reconciliation and rollback measurable without conflict-prone browser dual writes.
