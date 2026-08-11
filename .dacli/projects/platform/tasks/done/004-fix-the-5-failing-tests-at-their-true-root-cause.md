---
id: t-01KZRV1ABSMCVSCTDTP6V2FV30
kind: task
created: 2026-08-11T16:38:34Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 2, probable: 4, pessimistic: 8}"
---
# Fix the 5 failing tests at their true root cause
## Acceptance
- [x] States for each of the 5 failures whether the bug was in the test or in the implementation, and fixes the side that is actually wrong
- [x] Timezone dependence is removed by pinning TZ in the vitest config rather than by loosening the assertions
- [x] npx vitest run exits zero with zero failures
- [x] The duplicate exportService.spec.ts / exportService.test.ts pair is resolved to one authoritative file, with the reason recorded
## Log
- 2026-08-11T16:51:36Z claimed by a-fixer-6jvajv
- 2026-08-11T17:06:50Z accepted by a-root (applied 1 proposal(s))
- 2026-08-11T17:06:50Z verified by `true` (exit 0)
- 2026-08-11T17:06:50Z deliverable: dacli/004-fix-the-5-failing-tests-at-their-true-root-cause exists but is NOT in master — closed anyway
- 2026-08-11T17:06:50Z completed by a-root
