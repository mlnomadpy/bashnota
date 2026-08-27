---
id: role-supabase-reviewer
kind: role
created: 2026-08-13T21:32:28Z
created_by: a-root
name: supabase-reviewer
version: v1
summary: Independently reviews Supabase schema, RLS, auth identity, migration idempotency, reconciliation, secret boundaries, and rollback safety
skills: "[security, postgres, migration]"
scope: "[supabase/**, src/features/auth/**, src/features/bashhub/**, src/features/nota/**, src/services/**, package*.json, .github/**]"
grant: ro
role_kind: reviewer
wip: 2
runtime: codex-review
model: gpt-5.6-sol
max_points: 16
---
# supabase-reviewer
Independently reviews Supabase schema, RLS, auth identity, migration idempotency, reconciliation, secret boundaries, and rollback safety
