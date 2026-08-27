---
id: d-interlock-publication-references-and-object-deletion-with-an-atomic-database
kind: note
note_kind: decision
created: 2026-08-27T01:32:19Z
created_by: a-supabase-implementer-66yyfy
about: "[[t-01M10BZYS4VYEQJ5C7BVE438XZ]]"
---
# Interlock publication references and object deletion with an atomic database claim
## Chose
Interlock publication references and object deletion with an atomic database claim
## Rejected
Check references in the Edge Function and then delete from Storage
## Because
A publication could acquire a reference between the check and object removal. The claim marks eligible assets deleting in one database statement, and the publication trigger rejects claimed assets, preserving referenced images under concurrency.
