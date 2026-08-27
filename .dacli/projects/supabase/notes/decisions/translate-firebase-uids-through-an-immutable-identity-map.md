---
id: d-translate-firebase-uids-through-an-immutable-identity-map
kind: note
note_kind: decision
created: 2026-08-13T21:45:33Z
created_by: a-supabase-implementer-5jrb3a
about: "[[001]]"
---
# Translate Firebase UIDs through an immutable identity map
## Chose
Translate Firebase UIDs through an immutable identity map
## Rejected
Assume arbitrary Firebase UIDs can be preserved as Supabase Auth UUID primary keys
## Because
A private one-to-one map preserves legacy identity for reconciliation and rollback while domain foreign keys and RLS use Supabase auth UUIDs; public stability is provided by unchanged userTags and document IDs.
