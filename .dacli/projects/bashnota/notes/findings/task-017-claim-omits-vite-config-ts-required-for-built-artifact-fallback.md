---
id: f-task-017-claim-omits-vite-config-ts-required-for-built-artifact-fallback
kind: note
note_kind: finding
created: 2026-08-19T14:45:44Z
created_by: a-codex-fixer-terra-f012wn
about: "[[017]]"
severity: minor
---
# Task 017 claim omits vite.config.ts required for built-artifact fallback
The direct-deep-link fallback must be emitted during production build, which requires the Vite build configuration at vite.config.ts:13-24. dacli commit refused the otherwise task-scoped implementation because that file is not included in the recorded claim; committing with --force is necessary to preserve the required build integration.
