---
id: role-supabase-local-reviewer
kind: role
created: 2026-08-13T21:51:33Z
created_by: a-root
name: supabase-local-reviewer
version: v1
summary: Independently reviews local Supabase task branches without GitHub; may write only dacli verdict records and must not edit source
skills: "[security, postgres, migration]"
scope: "[docs/supabase/**, supabase/**, src/features/auth/**, src/features/bashhub/**, src/features/nota/**, src/services/**, package*.json, .github/**]"
grant: rw
role_kind: reviewer
wip: 2
runtime: codex-impl
model: gpt-5.6-sol
max_points: 16
---
# supabase-local-reviewer
Independently reviews local Supabase task branches without GitHub; may write only dacli verdict records and must not edit source
