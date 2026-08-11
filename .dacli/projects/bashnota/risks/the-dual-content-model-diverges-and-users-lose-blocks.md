---
id: r-the-dual-content-model-diverges-and-users-lose-blocks
kind: risk
created: 2026-08-11T16:30:03Z
created_by: a-root
impact: high
likelihood: medium
---
# The dual content model diverges and users lose blocks
## Indicators
- 22 typed Dexie block tables plus blockStructures coexist with Nota.content TipTap JSON
- Three TODO markers at nota.ts:1319/1379/1439 admit legacy conversion is still in use
## Action
Write a content round-trip test as the first item of the regression net
