---
id: d-pin-tz-utc-in-vitest-config-ts-to-remove-timezone-dependence
kind: note
note_kind: decision
created: 2026-08-11T16:58:21Z
created_by: a-fixer-6jvajv
about: "[[004]]"
---
# Pin TZ=UTC in vitest.config.ts to remove timezone dependence
## Chose
Pin TZ=UTC in vitest.config.ts to remove timezone dependence
## Rejected
Loosening the 5 assertions (e.g. accept any time-of-day bucket, or derive expected week/year from the same local Date the impl uses)
## Because
The implementations are correct: getHours/getFullYear/getDay in local time is the right behavior for a greeting/citation/stats feature. The tests encode UTC date literals and assume local==UTC. Pinning TZ makes that assumption true deterministically for every host, keeps the assertions meaningful (they still pin exact expected values), and changes zero source. Loosening assertions would have destroyed their value and hidden real regressions.
