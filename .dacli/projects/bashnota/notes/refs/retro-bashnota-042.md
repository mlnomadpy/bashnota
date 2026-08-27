---
id: r-retro-bashnota-042
kind: note
note_kind: ref
created: 2026-08-27T00:49:09Z
created_by: a-root
about: "[[t-01M0N6FGNKSD2ESRHJ27A8670Y]]"
---
# Retro: bashnota/042
## Went well
- One SECURITY DEFINER hierarchy RPC now validates and commits the full ordered tree atomically; Docker and browser-key tests cover rollback, races, response loss, and authoritative descendants.

## Didn't go well
- Initial store orchestration published children before the parent and swallowed failures; independent review also found edge, null-content, hydration, and stale-metadata cases.

## Improve next time
- Exercise publication through production store plus real browser-key Supabase, and reconcile response-loss against all mutable metadata.

