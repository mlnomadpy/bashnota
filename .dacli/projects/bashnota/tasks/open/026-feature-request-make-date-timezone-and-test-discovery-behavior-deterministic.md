---
id: t-01M0F8AY3R71441NKDJ992QVY6
kind: task
created: 2026-08-20T09:34:18Z
created_by: a-root
owner: a-root
github:
  issue: 7
  repo: mlnomadpy/bashnota
estimate: "{optimistic: 3, probable: 5, pessimistic: 8}"
---
# Feature request: make date, timezone, and test discovery behavior deterministic
## Context
Adopted from GitHub issue #7.

## Objective

Eliminate timezone-dependent failures, prevent cross-suite state leakage, and make the documented test commands deterministic.

## Current failures

- Citation-year behavior changes with the machine timezone.
- Three time-of-day tests use UTC fixtures while testing local-hour behavior.
- Week identifiers mix local-time calculations with UTC-style input fixtures.
- Root test discovery can include compiled tests under `functions/lib/` after the backend is built.

## Primary implementation areas

- `src/lib/citation.ts`
- `src/lib/__tests__/citation.test.ts`
- `src/utils/dateUtils.ts`
- `src/utils/__tests__/dateUtils.test.ts`
- `src/features/bashhub/services/statisticsService.ts`
- `src/features/bashhub/services/__tests__/statisticsService.test.ts`
- `vitest.config.ts`
- `functions/package.json`

## Required changes

- Define UTC versus user-local semantics for every date utility.
- Use UTC accessors for UTC-defined publication dates.
- Construct local-time fixtures when local behavior is intended.
- Restore real timers in `afterEach`, even when an assertion fails.
- Adopt a tested ISO-week implementation or clearly document and test the chosen Sunday-based convention.
- Exclude `functions/lib/**` from root Vitest discovery.
- Add explicit non-watch test scripts for root and Functions.
- Run tests under UTC, Pacific, and a positive-offset timezone in CI.

## Acceptance criteria

- All existing tests pass in each timezone job.
- Root tests remain stable before and after the Functions build.
- Fake timer state cannot leak across tests.
- Week and year boundary fixtures cover December/January transitions and daylight-saving changes.

## Acceptance
## Log
