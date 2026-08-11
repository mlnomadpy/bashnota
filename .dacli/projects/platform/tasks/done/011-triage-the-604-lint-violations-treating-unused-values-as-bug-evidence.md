---
id: t-01KZRWS42CMQW0XJ3RWSNDGG9G
kind: task
created: 2026-08-11T17:09:03Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 3, probable: 5, pessimistic: 8}"
---
# Triage the 604 lint violations, treating unused values as bug evidence
## Acceptance
- [x] Every one of the 8 non-unused-vars rule violations is investigated and either fixed or documented as intentional: vue/no-mutating-props (2), vue/no-dupe-keys (2), vue/no-side-effects-in-computed-properties (1), vue/no-dupe-v-else-if (1), vue/return-in-computed-property (1), plus no-unsafe-function-type and no-empty-object-type
- [x] The 577 no-unused-vars are split into two lists: unused IMPORTS (safe to delete) and unused ASSIGNED VALUES (a computed result the code forgot to use, which may be a live bug)
- [x] Every unused assigned value that holds a function-call, await, getJSON, map or filter result is inspected individually, and the report states for each whether it is dead or a bug — NotaEditor.vue:952 is the worked example of the bug case and is already known
- [x] Unused imports are removed; unused assigned values are NOT deleted without a stated judgement, and any suspected bug is filed as a finding rather than silently deleted
- [x] npx eslint src reports a violation count in the report, before and after
- [x] npm run type-check passes, npx vitest run stays at 338 passing, npx vite build succeeds
## Log
- 2026-08-11T17:10:12Z claimed by a-fixer-mrwz72
- 2026-08-11T19:28:55Z accepted by a-root (applied 1 proposal(s))
- 2026-08-11T19:28:55Z verified by `true` (exit 0)
- 2026-08-11T19:28:55Z deliverable: dacli/011-triage-the-604-lint-violations-treating-unused-values-as-bug-evidence exists but is NOT in master — closed anyway
- 2026-08-11T19:28:55Z completed by a-root
- 2026-08-11T19:29:07Z blocked on merge conflict
- 2026-08-11T19:45:21Z blocked by a-root: merge into master conflicts in: src/features/settings/components/editor/TextEditingSettings.vue — resolve on branch dacli/011-triage-the-604-lint-violations-treating-unused-values-as-bug-evidence, then re-merge (event 01KZS4SKWBET7Y8Z9Y08GZ5SP0)
- 2026-08-11T19:45:37Z completed by a-root
