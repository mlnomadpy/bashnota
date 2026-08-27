---
id: f-local-supabase-sql-suite-fixtures-require-a-removed-auth-users-column
kind: note
note_kind: finding
created: 2026-08-19T12:31:26Z
created_by: a-codex-fixer-terra-bmjzgy
about: "[[013]]"
severity: moderate
---
# Local Supabase SQL suite fixtures require a removed auth.users column
After fresh db reset applied 20260819000100_published_image_storage.sql, npx supabase@2.114.0 test db failed every existing SQL file because supabase/tests/database/{auth_identity_migration,auth_profiles,community,publishing,rls}.test.sql insert auth.users.email_confirmed_at, but the local auth.users relation lacks that column. This blocks the task-wide suite independently of the Storage migration.
