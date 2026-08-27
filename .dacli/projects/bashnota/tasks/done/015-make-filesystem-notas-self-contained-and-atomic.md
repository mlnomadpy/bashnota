---
id: t-01M0D7BYN6GF8K7AXHRC8BZF96
kind: task
created: 2026-08-19T14:38:54Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 5, probable: 8, pessimistic: 13}"
depends_on: "[014]"
github:
  issue: 21
  repo: mlnomadpy/bashnota
---
# Make filesystem notas self-contained and atomic
## So that
a selected notes directory alone can restore complete documents in a fresh browser profile
## Acceptance
- [x] Each filesystem nota or canonical companion atomically contains metadata, hierarchy, history, block order, IDs, and all 22 typed payloads
- [x] A directory-only fresh-profile reload preserves semantic content and stable identities for a multi-nota hierarchy
- [x] Switching modes migrates and verifies content before changing the authoritative backend
- [x] Injected write, rename, and migration failures leave the previous backend authoritative and recoverable
- [x] Filesystem integration, full Vitest, typecheck, build, bundle budget, and diff-check pass
## Log
- 2026-08-26T12:40:47Z claimed by a-root
- 2026-08-26T14:04:04Z accepted by a-root
- 2026-08-26T14:04:04Z closed WITHOUT verification — no --verify command was given
- 2026-08-26T14:04:04Z deliverable: dacli/015-make-filesystem-notas-self-contained-and-atomic is merged into master
- 2026-08-26T14:04:04Z completed by a-root
- 2026-08-26T14:09:13Z a-verifier-744gsx: verify-verdict: no-verdict — codex-rw (a-verifier-744gsx) on claim: 474972d makes filesystem notas self-contained and migration-safe; focused 15/15, full 509/510 with one skip, typecheck/build/governance gates pass — panelist reported nothing — counts as unconfirmed (event 01M0Z30GB0JC1ES91BEBRBY24H)
- 2026-08-26T14:09:13Z a-root: PR opened: https://github.com/mlnomadpy/bashnota/pull/22 (event 01M0Z5SRMX8CP4RNMG4V058K0M)
- 2026-08-26T14:09:13Z a-root: Landing policy override: mode=pr base=master (event 01M0Z66EWT18PJRJEX11P10QH2)
- 2026-08-26T14:09:13Z a-root: Integrated via PR https://github.com/mlnomadpy/bashnota/pull/22 at merge commit debe09fdbb311ea26a79debe3829d0304e9c4dc8 into master (event 01M0Z66FGQ32E0FJRTS8FNSA9K)
