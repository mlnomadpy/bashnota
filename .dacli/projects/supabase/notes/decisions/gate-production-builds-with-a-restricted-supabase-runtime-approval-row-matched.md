---
id: d-gate-production-builds-with-a-restricted-supabase-runtime-approval-row-matched
kind: note
note_kind: decision
created: 2026-08-19T12:24:10Z
created_by: a-codex-fixer-terra-c1rexx
about: "[[012]]"
---
# Gate production builds with a restricted Supabase runtime approval row matched to public-config and evidence hashes
## Chose
Gate production builds with a restricted Supabase runtime approval row matched to public-config and evidence hashes
## Rejected
Use GitHub variables alone as the production-cutover approval
## Because
A database-backed verifier fails closed unless the exact deployment inputs match an explicit operator approval, avoiding a mutable CI-only cutover flag.
