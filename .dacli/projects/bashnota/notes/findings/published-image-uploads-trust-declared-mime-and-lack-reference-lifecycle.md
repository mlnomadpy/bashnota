---
id: f-published-image-uploads-trust-declared-mime-and-lack-reference-lifecycle
kind: note
note_kind: finding
created: 2026-08-27T01:11:43Z
created_by: a-supabase-implementer-66yyfy
about: "[[t-01M10BZYS4VYEQJ5C7BVE438XZ]]"
severity: major
---
# Published image uploads trust declared MIME and lack reference lifecycle metadata
src/services/cloud/supabaseImageStorage.ts:12-25 never parses raster bytes; the direct browser Storage policy is metadata-only and deletion has no reference check.
