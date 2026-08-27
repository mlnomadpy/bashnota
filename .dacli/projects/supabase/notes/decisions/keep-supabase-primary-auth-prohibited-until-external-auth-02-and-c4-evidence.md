---
id: d-keep-supabase-primary-auth-prohibited-until-external-auth-02-and-c4-evidence
kind: note
note_kind: decision
created: 2026-08-14T00:52:39Z
created_by: a-root
about: "[[t-01KZYG4G41ARV7RGQ7GCZCDPCK]]"
---
# Keep Supabase primary auth prohibited until external AUTH-02 and C4 evidence
## Chose
Keep Supabase primary auth prohibited until external AUTH-02 and C4 evidence
## Rejected
Activate Supabase primary auth when task 004 code lands
## Because
Local GoTrue cannot exercise the configured Google provider, production public variables are not configured, and task 007 reconciliation has not run. The landed code therefore defaults Firebase and treats Supabase activation as a separately gated canary operation.
