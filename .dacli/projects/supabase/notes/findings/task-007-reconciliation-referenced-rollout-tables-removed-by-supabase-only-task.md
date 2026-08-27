---
id: f-task-007-reconciliation-referenced-rollout-tables-removed-by-supabase-only-task
kind: note
note_kind: finding
created: 2026-08-19T12:30:36Z
created_by: a-codex-fixer-1a6ne8
about: "[[014]]"
severity: major
---
# Task 007 reconciliation referenced rollout tables removed by Supabase-only task 010
Fresh db reset failed applying supabase/migrations/20260819000200_legacy_migration_rehearsal.sql because reconcile_legacy_migration selected auth_rollout_state/publishing_rollout_state/community_rollout_state, all dropped by 20260819000100_supabase_only_runtime_and_image_storage.sql. The port now proves cutoverDisabled from runtime_deployment_state.production_cutover=false instead.
