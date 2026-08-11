---
id: t-01KZRTSZTTP1YCS6BPXZ1ABGYR
kind: task
created: 2026-08-11T16:34:34Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 3, probable: 5, pessimistic: 10}"
---
# Reconstruct product intent and audit the feature inventory
## Acceptance
- [x] States in one defensible paragraph what BashNota is trying to be, derived from the router, the Dexie schema, the type definitions and git history rather than from the README
- [x] Produces a complete feature inventory covering every user-reachable capability, each graded complete/partial/stubbed/dead/orphaned with file:line evidence
- [x] Lists every capability that is built and working but that nothing routes to or surfaces in the UI, since orphaned capability is the cheapest value in an abandoned codebase
- [x] Names every contradiction between what README.md, VIBEME.md, docs/ and the 6 root status-report markdowns claim and what the code actually does
- [x] Evaluates whether docs/MISSING_FEATURES.md and docs/UX_UI_IMPROVEMENTS.md were correct when written and which of their items are now stale
- [x] Proposes at least 8 new capabilities, each naming the specific existing assets it composes, a rough effort band, and why it fits the product identity rather than being a generic SaaS feature
- [x] Every finding filed via 'dacli note add finding --project bashnota --about <task>' with a file:line origin
## Log
- 2026-08-11T16:34:47Z claimed by a-product-analyst-ynhtav
- 2026-08-11T19:45:11Z accepted by a-root (applied 1 proposal(s))
- 2026-08-11T19:45:11Z verified by `grep -rlq t-01KZRTSZTTP1YCS6BPXZ1ABGYR .dacli/events` (exit 0)
- 2026-08-11T19:45:11Z deliverable: no dacli/010-reconstruct-product-intent-and-audit-the-feature-inventory branch — nothing to check against master
- 2026-08-11T19:45:11Z completed by a-root
- 2026-08-11T19:45:21Z finding by a-product-analyst-hph7zg: Product intent: BashNota is a local-first, code-and-AI-native research notebook with a publish-to-web social layer (event 01KZRVNB3ZH8RYTAQ2JG1GK213)
- 2026-08-11T19:45:21Z finding by a-product-analyst-hph7zg: Feature inventory: 30+ user-reachable capabilities graded, with the block palette and publishing complete, AI-chat orphaned (event 01KZRVP3CGGP5M3C2H51CP58C2)
