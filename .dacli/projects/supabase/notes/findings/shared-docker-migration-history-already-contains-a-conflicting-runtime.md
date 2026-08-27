---
id: f-shared-docker-migration-history-already-contains-a-conflicting-runtime
kind: note
note_kind: finding
created: 2026-08-19T12:33:29Z
created_by: a-codex-fixer-terra-c1rexx
about: "[[012]]"
severity: moderate
---
# Shared Docker migration history already contains a conflicting runtime deployment migration ID
The local Docker database reports 20260819000100 applied, but its public.runtime_deployment_state has only singleton, production_cutover, and updated_at; task 012's original migration with that ID therefore was not applied. The gate migration is now uniquely numbered 20260819001200 and additive so it extends the shared state safely.
