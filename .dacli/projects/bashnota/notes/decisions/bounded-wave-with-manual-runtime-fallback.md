---
id: d-bounded-wave-with-manual-runtime-fallback
kind: note
note_kind: decision
created: 2026-08-26T14:11:15Z
created_by: a-root
about: "[[042]]"
---
# bounded-wave-with-manual-runtime-fallback
## Chose
Run a three-task bounded wave (018, 020, 042). Route 042 to high-rigor backend/Supabase implementation because data integrity consequences exceed the default Terra route. Dacli remains the durable system of record, but configured verifier runtimes are not trusted until runtime doctor grant mismatches are repaired; use in-process independent reviews and record the limitation.
## Rejected
Launching the persisted wave profile unchanged
## Because
Its verification commands are Go defaults for a Vue/TypeScript/Supabase repository and runtime doctor reports unenforceable read-only grants.
