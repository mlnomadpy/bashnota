---
id: f-public-adapter-fabricates-empty-author-uuid-and-emits-broken-author-urls
kind: note
note_kind: finding
created: 2026-08-14T01:25:43Z
created_by: a-root
about: "[[t-01KZYG4W01FYGE10ZF3X9D5CXD]]"
severity: moderate
---
# Public adapter fabricates empty author UUID and emits broken author URLs
Safe projection omits private UUID, adapter supplies authorId:'', and PublicNotaView builds /@ metadata from it. Make private ID optional/absent and use authorTag for all public links/metadata.
