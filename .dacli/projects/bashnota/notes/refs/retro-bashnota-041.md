---
id: r-retro-bashnota-041
kind: note
note_kind: ref
created: 2026-08-27T00:08:47Z
created_by: a-root
about: "[[t-01M0N6FGGYVRA6XMYQ8B9M0D3X]]"
---
# Retro: bashnota/041
## Went well
- Typed storage errors and last-good library retention were proven through real adapter integration and green GitHub Quality.

## Didn't go well
- Initial coverage masked IndexedDBBackend returning an empty list; independent review required a production adapter regression.

## Improve next time
- Test authoritative storage failures through initialized production adapters, not only store mocks.

