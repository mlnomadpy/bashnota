---
id: d-use-one-unconditional-composed-supabase-cloudapi
kind: note
note_kind: decision
created: 2026-08-19T11:55:10Z
created_by: a-codex-fixer-jyr8b6
about: "[[t-01M0AN95FCS0QPWGRFK8D6Q7KB]]"
---
# Use one unconditional composed Supabase CloudApi
## Chose
Use one unconditional composed Supabase CloudApi
## Rejected
Retain rollout selectors or a Firebase compatibility fallback
## Because
The owner requires Supabase to be the sole production backend; provider selection and failover preserve prohibited runtime and configuration paths.
