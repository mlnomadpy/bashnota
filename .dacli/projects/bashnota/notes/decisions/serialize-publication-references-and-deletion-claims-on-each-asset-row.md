---
id: d-serialize-publication-references-and-deletion-claims-on-each-asset-row
kind: note
note_kind: decision
created: 2026-08-27T02:32:36Z
created_by: a-supabase-implementer-fey0x8
about: "[[t-01M10BZYS4VYEQJ5C7BVE438XZ]]"
---
# Serialize publication references and deletion claims on each asset row
## Chose
Serialize publication references and deletion claims on each asset row
## Rejected
Rely on an unlocked reference existence check before Storage deletion
## Because
Both database paths must contend on the same row so the loser observes either deleting_at or the committed reference before external object removal.
