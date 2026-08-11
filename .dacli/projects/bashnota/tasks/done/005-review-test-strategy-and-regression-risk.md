---
id: t-01KZRSX034BWDE84AWXDZ2SCHX
kind: task
created: 2026-08-11T16:18:44Z
created_by: a-root
owner: a-root
priority: should
estimate: "{optimistic: 2, probable: 4, pessimistic: 8}"
---
# Review: test strategy and regression risk
## Acceptance
- [x] Diagnoses the root cause of all 5 failing tests with file:line, and states the fix for each
- [x] Ranks the untested surface by RISK not by count — names the 10 modules where a silent regression would hurt users most
- [x] Assesses the quality of the existing service-layer tests: do they test behaviour or restate the implementation
- [x] Proposes a minimum viable regression net: a specific list of test files to write first, with the bug each would have caught
- [x] Every finding is filed via 'dacli note add finding' with an --origin of file:line
## Log
- 2026-08-11T16:20:16Z claimed by a-test-reviewer-ce29ny
- 2026-08-11T16:37:36Z accepted by a-root (applied 1 proposal(s))
- 2026-08-11T16:37:36Z closed WITHOUT verification — no --verify command was given
- 2026-08-11T16:37:36Z deliverable: no dacli/005-review-test-strategy-and-regression-risk branch — nothing to check against master
- 2026-08-11T16:37:36Z completed by a-root
- 2026-08-11T16:37:41Z finding by a-test-reviewer-ce29ny: All 5 failing tests share one root cause: timezone-dependent date tests (no TZ pinned in vitest) (event 01KZRT3VPRC1TM1FC9BJBVDKHR)
- 2026-08-11T16:37:41Z finding by a-test-reviewer-ce29ny: Service-layer tests are behaviour-oriented (good), but share a systemic blind spot: document CONTENT is never round-tripped (event 01KZRT7KPN47R6JWT5HEY2TQHP)
- 2026-08-11T16:37:41Z finding by a-test-reviewer-ce29ny: Untested surface ranked by RISK: the 10 modules where a silent regression would hurt users most (all 0% tested) (event 01KZRT83445ZWKB697VTABWKWX)
- 2026-08-11T16:37:41Z finding by a-test-reviewer-ce29ny: Minimum viable regression net: 6 test files to write first, each tied to the concrete bug it would catch (event 01KZRT97EQBEZVVB3F3Z69H2ZT)
- 2026-08-11T16:37:41Z finding by a-test-reviewer-ce29ny: docs/MISSING_TESTS.md is stale and understates coverage — do not plan from it (event 01KZRT9FY3DKWMV1F6PHSGSTFP)
