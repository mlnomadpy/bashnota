---
id: f-docker-gate-reaches-the-approved-build-but-the-worktree-lacks-the-declared
kind: note
note_kind: finding
created: 2026-08-19T12:33:29Z
created_by: a-codex-fixer-terra-c1rexx
about: "[[012]]"
severity: moderate
---
# Docker gate reaches the approved build but the worktree lacks the declared Supabase package
supabase/tests/deploy/production-deploy-gate.integration.mjs proves the unapproved gate fails and the explicit fixture passes it, then npm run build-only fails resolving @supabase/supabase-js from src/services/cloud/supabaseBrowser.ts. package.json declares the dependency; this worktree needs npm ci before the full build can pass.
