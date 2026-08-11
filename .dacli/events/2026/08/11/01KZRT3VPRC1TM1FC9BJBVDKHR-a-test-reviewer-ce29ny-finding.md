---
id: 01KZRT3VPRC1TM1FC9BJBVDKHR
kind: event
event_kind: finding
created: 2026-08-11T16:22:29Z
created_by: a-test-reviewer-ce29ny
about: "[[t-01KZRSX034BWDE84AWXDZ2SCHX]]"
origin: src/utils/dateUtils.ts:42
applied: true
---
All 5 failing tests share one root cause: timezone-dependent date tests (no TZ pinned in vitest)

Machine TZ is PDT (UTC-7). vitest.config.ts sets environment jsdom but NO TZ and NO setupFiles, so tests that hardcode UTC ('...Z') instants but assert against values computed with LOCAL Date methods diverge.

FAILURE 1-3 (src/utils/__tests__/dateUtils.test.ts:104,111,118): getTimeOfDay() at src/utils/dateUtils.ts:42 uses new Date().getHours() (LOCAL). Tests setSystemTime('2024-01-15T14:00:00Z') -> 07:00 PDT -> 'morning' not 'afternoon'; 18:00Z->11:00->'morning' not 'evening'; 21:00Z->14:00->'afternoon' not 'night'.

FAILURE 4 (src/features/bashhub/services/__tests__/statisticsService.test.ts:35): getWeekIdentifier at statisticsService.ts:427-439 uses local getDay/getFullYear. Test date new Date('2024-01-07') = UTC midnight -> 2024-01-06 17:00 PDT (Saturday) -> week rolls back to '2023-52' so weekPart[0]='5' not '0'.

FAILURE 5 (src/lib/__tests__/citation.test.ts:88): generateBibTeX year = new Date(nota.publishedAt).getFullYear() at src/lib/citation.ts:32 (LOCAL). Test sets publishedAt=new Date('2020-01-01').toISOString() -> 2019-12-31 PDT -> year 2019, citeKey smith2019.

FIX (single, fixes all 5): pin TZ for the test run. Add to package.json test:unit script 'cross-env TZ=UTC vitest' OR add test.env TZ:'UTC' won't take effect early enough for module Dates but works for these test-body Dates; the robust fix is the cross-env TZ=UTC on the runner (and in CI). Per-test alternative: construct dates with local components new Date(2024,0,15,14,0,0) instead of 'Z' strings. Production code is arguably correct (getTimeOfDay intentionally local); only citation.ts:32 has a latent minor real bug (a nota published at 00:00Z shows prior year for west-of-UTC users).
