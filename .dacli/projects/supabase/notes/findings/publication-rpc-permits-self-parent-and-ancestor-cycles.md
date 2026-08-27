---
id: f-publication-rpc-permits-self-parent-and-ancestor-cycles
kind: note
note_kind: finding
created: 2026-08-14T01:44:40Z
created_by: a-root
about: "[[t-01KZYG4W01FYGE10ZF3X9D5CXD]]"
severity: major
---
# Publication RPC permits self-parent and ancestor cycles
publish_nota validates proposed parent ownership but not p_parent_id=p_id or whether the parent ancestor chain contains p_id. Owners can create self/multi-row cycles, hiding rows from root listings and violating canonical tree semantics. Reject atomically before upsert and test failed self/ancestor reparent leaves rows/edges unchanged in pgTAP and browser-key integration.
