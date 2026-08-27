---
id: f-clean-supabase-reset-and-rls-suite-pass-locally
kind: note
note_kind: finding
created: 2026-08-13T22:34:24Z
created_by: a-supabase-implementer-bf1xyk
about: "[[002]]"
severity: minor
---
# Clean Supabase reset and RLS suite pass locally
Supabase CLI 2.114.0 applied supabase/migrations/20260813000100_create_bashnota_schema.sql and 20260813000200_rls_and_privileged_mutations.sql from an empty local database; supabase/tests/database/rls.test.sql passes 39/39 and db lint reports no schema errors.
