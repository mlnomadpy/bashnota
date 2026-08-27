---
id: d-decode-and-re-encode-uploaded-rasters-with-wasm-before-storage
kind: note
note_kind: decision
created: 2026-08-27T10:34:43Z
created_by: a-supabase-implementer-3v0cpm
about: "[[t-01M10BZYS4VYEQJ5C7BVE438XZ]]"
---
# Decode and re-encode uploaded rasters with WASM before Storage
## Chose
Decode and re-encode uploaded rasters with WASM before Storage
## Rejected
Extend signature and container parsing alone
## Because
Complete JPEG, WebP, GIF, and compressed PNG validation requires real codecs; authoritative WASM decoding plus metadata-stripping PNG re-encoding collapses polyglot parser ambiguity before bytes cross the Storage boundary.
