---
id: f-concurrent-publication-reparents-can-race-into-a-cycle
kind: note
note_kind: finding
created: 2026-08-14T01:54:48Z
created_by: a-root
about: "[[t-01KZYG4W01FYGE10ZF3X9D5CXD]]"
severity: major
---
# Concurrent publication reparents can race into a cycle
Sequential cycle checks can race when concurrent same-owner RPCs set A.parent=B and B.parent=A; each observes roots and updates a different row. Serialize hierarchy validation/mutation per owner with transaction advisory lock or equivalent, and add a concurrent RPC integration proving at most one succeeds and final graph is acyclic.
