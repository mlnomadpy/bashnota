---
id: d-supabase-is-the-sole-production-backend
kind: note
note_kind: decision
created: 2026-08-18T14:44:19Z
created_by: a-root
about: "[[t-01KZYG5WVKKD6FNSZ519M8DEKX]]"
severity: major
---
# Supabase is the sole production backend
## Chose
Owner explicitly rejected Firebase-default and fallback operation on 2026-08-18. Remove Firebase runtime, SDK, configuration, functions, rules, emulator tooling, and provider branches. Supabase must be the only production backend. Validate the complete Firebase-free application against the local Docker Supabase stack before deployment. External production data import and canary evidence remain separate deployment gates, not reasons to retain Firebase in application code.
## Rejected
Keep Firebase as production default until external staging/canary gates pass
## Because
The owner explicitly requires a Supabase-only production architecture and Firebase removal.
