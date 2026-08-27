---
id: r-retro-bashnota-015-make-filesystem-notas-self-contained-and-atomic
kind: note
note_kind: ref
created: 2026-08-26T14:05:25Z
created_by: a-root
about: "[[t-01M0D7BYN6GF8K7AXHRC8BZF96]]"
---
# Retro: bashnota/015-make-filesystem-notas-self-contained-and-atomic
## Went well
- Independent adversarial review repeatedly reproduced concurrency and rollback defects before landing
- Full local and GitHub gates covered storage, type, build, purity, hygiene, deployment, and browser export security

## Didn't go well
- Legacy dacli runtime adapters could not produce a native verify-panel verdict
- GitHub merged immediately before Quality because repository protections did not gate merge

## Improve next time
- Repair dacli runtime adapters and require the Quality check/auto-merge protection before future PR landing

