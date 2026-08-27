---
id: r-retro-bashnota-040
kind: note
note_kind: ref
created: 2026-08-27T00:13:54Z
created_by: a-root
about: "[[t-01M0N6FGC8NQD51D11Q68WKJN2]]"
---
# Retro: bashnota/040
## Went well
- One accessible AuthFeedback boundary now owns failure rendering, and strict true-result gating prevents false success across all auth flows.

## Didn't go well
- Initial coverage missed Profile reset and OAuth callback false/rejected branches; independent review expanded the matrix.

## Improve next time
- Use a shared feedback boundary and test literal false, rejection, retry clearing, and success for every auth entry point.

