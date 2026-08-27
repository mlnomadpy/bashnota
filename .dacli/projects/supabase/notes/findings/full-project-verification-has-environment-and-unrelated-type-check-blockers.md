---
id: f-full-project-verification-has-environment-and-unrelated-type-check-blockers
kind: note
note_kind: finding
created: 2026-08-13T21:58:38Z
created_by: a-codex-fixer-terra-h2p4hk
about: "[[001]]"
severity: minor
---
# Full project verification has environment and unrelated type-check blockers
Evidence from this worktree: npm run test:unit -- --run passes 39 files/432 tests; node docs/supabase/verify-firebase-supabase.mjs passes. npm run build exits nonzero on src/features/editor/components/blocks/executable-code-block/ai/components/AIActionPanel.vue:179 (TS2769), outside this task's claimed docs path. npm run test:iframe-security exits because its Chrome sandbox result is empty. firebase is not on PATH, so package.json test:rules cannot run locally.
