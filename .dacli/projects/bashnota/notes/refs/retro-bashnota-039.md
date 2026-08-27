---
id: r-retro-bashnota-039
kind: note
note_kind: ref
created: 2026-08-27T00:22:10Z
created_by: a-root
about: "[[t-01M0N6FG7J3V1814K0ZWM5R2SD]]"
---
# Retro: bashnota/039
## Went well
- NotaPane now has explicit loading, ready, not-found, and error recovery states with sibling-pane preservation.

## Didn't go well
- The original store swallowed read failures, making missing notes and authority errors indistinguishable.

## Improve next time
- Model async view states explicitly and test missing, rejected, retry, and scoped-close behavior together.

