---
id: t-01KZRSXR3BZN6YK9YG0VCZMVPW
kind: task
created: 2026-08-11T16:19:09Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 2, probable: 4, pessimistic: 8}"
---
# Review: build tooling, CI and dependency health
## Acceptance
- [x] Gives the exact diff to make type-check stop emitting .js into src/ and verifies the claim by reading the tsconfig chain
- [x] Gives the exact corrected eslint.config.ts that makes the TS parser apply, explaining why the current ordering fails
- [x] Proposes a CI workflow that gates deploy on type-check + test + lint, written out in full
- [x] Audits all 100+ dependencies: names every one that is unused, duplicated, or superseded, with evidence of non-import for the unused ones
- [x] Every finding is filed via 'dacli note add finding' with an --origin of file:line
## Log
- 2026-08-11T16:20:16Z claimed by a-tooling-reviewer-mfed01
- 2026-08-11T16:37:36Z accepted by a-root (applied 1 proposal(s))
- 2026-08-11T16:37:36Z closed WITHOUT verification — no --verify command was given
- 2026-08-11T16:37:36Z deliverable: no dacli/008-review-build-tooling-ci-and-dependency-health branch — nothing to check against master
- 2026-08-11T16:37:36Z completed by a-root
- 2026-08-11T16:37:41Z finding by a-tooling-reviewer-mfed01: type-check uses vue-tsc --build with references that lack composite:true — an internally inconsistent tsconfig chain (event 01KZRT9H3R5624WHV5DP15FR2V)
- 2026-08-11T16:37:41Z finding by a-tooling-reviewer-mfed01: eslint.config.ts never registers a TS parser: no vueTsConfigs.* entry means @vue/eslint-config-typescript skips its parser-injection step, so 425/426 lint 'errors' are Parsing error: Unexpected token (event 01KZRTC1D5WB2TVE5JN5VA2E16)
- 2026-08-11T16:37:41Z finding by a-tooling-reviewer-mfed01: 14 root dependencies are unused (zero imports repo-wide); several are duplicate/superseded pairs and 3 are accidental-install junk (i, install, npm) (event 01KZRTGM7PKQV91B0PVC7APJBX)
- 2026-08-11T16:37:41Z finding by a-tooling-reviewer-mfed01: deploy.yml ships to production with no quality gate — build-only bypasses type-check, and lint/test never run (event 01KZRTGT6EYQZMT82KSNFWQF80)
- 2026-08-11T16:37:41Z finding by a-tooling-reviewer-mfed01: FIX: stop type-check emitting into src — add composite:true + noEmit:true to the three referenced tsconfigs (event 01KZRTJD7QKMXNGM6WMJT4311G)
- 2026-08-11T16:37:41Z finding by a-tooling-reviewer-mfed01: FIX: exact corrected eslint.config.ts that registers the TS parser (add vueTsConfigs.recommended) (event 01KZRTJSB6XCCK0MZHD0V6WW4G)
- 2026-08-11T16:37:41Z finding by a-tooling-reviewer-mfed01: FIX: full deploy.yml that gates deploy on type-check + lint + test (with Node pin + CI scripts) (event 01KZRTM2SSWPDHRSGY9CE1F7E7)
