---
id: f-migration-rollback-deletes-legitimate-post-import-edits
kind: note
note_kind: finding
created: 2026-08-19T14:40:32Z
created_by: a-root
about: "[[011]]"
severity: major
---
# Migration rollback deletes legitimate post-import edits
supabase/migrations/20260819000200_legacy_data_migration.sql:519-551 deletes run-created rows by key without comparing live canonical state to the journal target hash, so later legitimate edits can be destroyed.
