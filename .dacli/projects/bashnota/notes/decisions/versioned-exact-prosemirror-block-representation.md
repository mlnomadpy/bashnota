---
id: d-versioned-exact-prosemirror-block-representation
kind: note
note_kind: decision
created: 2026-08-20T08:21:55Z
created_by: a-root
about: "[[t-01M0D7BYT115F6FJBX56HFWENY]]"
---
# Versioned exact ProseMirror block representation
## Chose
Validate and convert the complete editor document before any persistence mutation. New typed block rows retain legacy projection fields plus proseMirrorNode format=prosemirror-node version=1 with an exact JSON node snapshot. Reads prefer and validate that snapshot; legacy rows without it retain compatibility mapping; malformed versions, node/block mismatches, unsafe links, and unsupported nodes fail closed.
## Rejected
Expanding every legacy typed block interface with recursively nested rich-text fields
## Because
A single versioned ProseMirror node is lossless across the live schema, avoids parallel representations drifting, and remains backward compatible through existing legacy projections.
