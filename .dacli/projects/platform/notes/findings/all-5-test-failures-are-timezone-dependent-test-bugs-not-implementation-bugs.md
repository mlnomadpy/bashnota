---
id: f-all-5-test-failures-are-timezone-dependent-test-bugs-not-implementation-bugs
kind: note
note_kind: finding
created: 2026-08-11T16:58:15Z
created_by: a-fixer-6jvajv
about: "[[004]]"
severity: moderate
---
# All 5 test failures are timezone-dependent TEST bugs, not implementation bugs
Root cause per failure (bug is in the TEST side each time; the implementations correctly use local-time date methods, which is right for a UI greeting/citation/stats app):
1-3. src/utils/__tests__/dateUtils.test.ts getTimeOfDay (14:00Z/18:00Z/21:00Z) — impl dateUtils.ts:42 uses new Date().getHours() (local); tests pass UTC literals and expect the UTC hour. On a negative-offset host the hour shifts back a bucket. TEST bug.
4. src/lib/__tests__/citation.test.ts:84 'different years' — mockNota.publishedAt=new Date('2020-01-01') is UTC midnight; impl citation.ts:32 uses getFullYear() (local) so in negative TZ it becomes 2019 -> year={2019}/smith2019. Other citation tests use 2023-06-15 (mid-month) so never shift. TEST bug.
5. src/features/bashhub/services/__tests__/statisticsService.test.ts:28 'pad week numbers' — new Date('2024-01-07') is UTC midnight; impl statisticsService.ts:427 uses local getDay()/getDate()/getFullYear(), so in negative TZ it rolls to 2023-12-31 -> week 53 -> weekPart[0]='5'. TEST bug.
Fix: pin process.env.TZ='UTC' + test.env.TZ='UTC' in vitest.config.ts so local==UTC and the UTC literals line up. No assertions loosened, no source changed. All 5 green; full suite 350/350.
