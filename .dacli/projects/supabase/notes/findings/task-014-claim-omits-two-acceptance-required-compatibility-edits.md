---
id: f-task-014-claim-omits-two-acceptance-required-compatibility-edits
kind: note
note_kind: finding
created: 2026-08-19T12:45:03Z
created_by: a-codex-fixer-1a6ne8
about: "[[014]]"
severity: moderate
---
# Task 014 claim omits two acceptance-required compatibility edits
After aligning new artifacts to claimed scripts/legacy-migration, supabase/tests/migration, supabase/migrations/20260819000200_legacy_data_migration.sql, supabase/types/database.types.ts, docs/supabase/data-migration-runbook.md, and package.json, dacli still excludes scripts/check-backend-purity.mjs and supabase/tests/database/migration_rehearsal.test.sql. Both are necessary: the former exhaustively distinguishes offline legacy fields from prohibited SDK/Admin/tool dependencies; the latter keeps task-007 lease/provenance/audit/rollback SQL regressions executable after neutral RPC/table names. Owner acceptance explicitly requires both gates.
