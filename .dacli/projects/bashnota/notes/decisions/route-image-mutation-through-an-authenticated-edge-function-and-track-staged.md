---
id: d-route-image-mutation-through-an-authenticated-edge-function-and-track-staged
kind: note
note_kind: decision
created: 2026-08-27T01:11:53Z
created_by: a-supabase-implementer-66yyfy
about: "[[t-01M10BZYS4VYEQJ5C7BVE438XZ]]"
---
# Route image mutation through an authenticated Edge Function and track staged assets plus publication references transactionally
## Chose
Route image mutation through an authenticated Edge Function and track staged assets plus publication references transactionally
## Rejected
Continue direct browser Storage uploads with client-only byte validation and path-prefix deletion
## Because
Client validation is bypassable with the publishable key, Storage MIME limits inspect metadata rather than decoded raster structure, and prefix ownership cannot distinguish referenced assets from rollback orphans.
