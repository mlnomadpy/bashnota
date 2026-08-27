---
id: d-route-task046-repair-to-supabase-implementer-without-pr-authority
kind: note
note_kind: decision
created: 2026-08-27T09:42:34Z
created_by: a-root
about: "[[bashnota/046-enforce-typed-api-authentication-request-bounds-and-rate-limits]]"
---
# Route task046 repair to Supabase implementer without PR authority
## Chose
Route task046 repair to Supabase implementer without PR authority
## Rejected
Wait for the single security-fixer slot or allow detached auto-merge
## Because
The repair is specifically PostgREST/Kong trusted-client identity and Postgres quota retention; supabase-implementer has matching capability and spare WIP, while owner-only PR landing prevents another pre-CI merge.
