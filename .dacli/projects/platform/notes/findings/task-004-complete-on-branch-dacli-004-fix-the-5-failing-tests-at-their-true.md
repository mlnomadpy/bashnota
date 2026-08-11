---
id: f-task-004-complete-on-branch-dacli-004-fix-the-5-failing-tests-at-their-true
kind: note
note_kind: finding
created: 2026-08-11T16:59:36Z
created_by: a-fixer-6jvajv
about: "[[004]]"
severity: minor
---
# Task 004 complete on branch dacli/004-fix-the-5-failing-tests-at-their-true-root-cause — all 4 acceptance criteria met
Commit 2740c9d. Proof:
- npx vitest run: 350 passed (350), 0 failed, exit 0. (Was 5 failed/346 passed across 3 files.)
- npx vite build: built in ~19s, main chunk 10,057.89 kB — matches baseline, no regression.
- npx vue-tsc --build: only the 4 pre-existing baseline errors (Bibliography.vue x2, UnifiedAdvancedSettings.vue x2); none in any file I touched. No regression.

Criteria:
1. Per-failure test-vs-impl verdict recorded in finding 'All 5 test failures are timezone-dependent TEST bugs'; all 5 are test-side, implementations left unchanged.
2. TZ pinned in vitest.config.ts (process.env.TZ='UTC' + test.env.TZ='UTC'); no assertions loosened.
3. vitest exits zero, zero failures.
4. Duplicate resolved: deleted the 80-line subset exportService.test.ts, renamed the comprehensive 342-line exportService.spec.ts -> exportService.test.ts (repo convention: 24 .test.ts, 0 other .spec.ts). Reason recorded in decision note.

Files changed: vitest.config.ts (M), exportService.spec.ts (D)->exportService.test.ts (rename). No source files modified. Ready for dacli accept.
