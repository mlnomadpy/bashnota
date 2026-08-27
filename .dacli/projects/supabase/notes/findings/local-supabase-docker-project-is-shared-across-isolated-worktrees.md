---
id: f-local-supabase-docker-project-is-shared-across-isolated-worktrees
kind: note
note_kind: finding
created: 2026-08-19T12:37:45Z
created_by: a-codex-fixer-1a6ne8
about: "[[014]]"
severity: moderate
---
# Local Supabase Docker project is shared across isolated worktrees
During npm run test:supabase, runtime_storage.test.sql observed production_cutover=true even though this branch reset it false. A read-only API query showed task-012-only evidence columns and approved_by=local-docker-fixture, proving another worktree reset/mutated the same project_id=bashnota Docker stack mid-suite. Git worktree isolation does not isolate Supabase containers; rehearsals must run without sibling stack activity or with a unique temporary project/port set.
