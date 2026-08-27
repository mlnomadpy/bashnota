---
id: r-retro-bashnota-018
kind: note
note_kind: ref
created: 2026-08-27T01:03:57Z
created_by: a-root
about: "[[t-01M0D7BZ1NHDKSJ8VJYS9JTY5Y]]"
---
# Retro: bashnota/018
## Went well
- Independent exact-SHA review plus local and GitHub real-Chrome gates caught and closed process-lifecycle regressions before landing.

## Didn't go well
- The stale task branch required repeated master merges, and the initial route harness initially repeated the Chrome self-close assumption fixed in task045.

## Improve next time
- Share one governed browser harness and require exact merged-head review before push for long-lived performance/security branches.

