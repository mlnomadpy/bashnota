---
id: f-local-generated-public-types-include-unrelated-schema-drift
kind: note
note_kind: finding
created: 2026-08-19T12:33:18Z
created_by: a-codex-fixer-terra-bmjzgy
about: "[[013]]"
severity: minor
---
# Local generated public types include unrelated schema drift
npm run supabase:types after the fresh Storage migration produced no Storage declarations (generation targets --schema public) but a large unrelated diff in supabase/types/database.types.ts, including legacy_migration_* and runtime_deployment_state absent from this worktree's migration list. The generated file was restored to HEAD; this task's Storage-only migration cannot account for the drift.
