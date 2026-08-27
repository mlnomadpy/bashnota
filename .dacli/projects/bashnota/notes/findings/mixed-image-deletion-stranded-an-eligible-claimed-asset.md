---
id: f-mixed-image-deletion-stranded-an-eligible-claimed-asset
kind: note
note_kind: finding
created: 2026-08-27T02:42:05Z
created_by: a-supabase-implementer-fey0x8
about: "[[t-01M10BZYS4VYEQJ5C7BVE438XZ]]"
severity: major
---
# Mixed image deletion stranded an eligible claimed asset
supabase/functions/published-images/index.ts:81-96 previously claimed every eligible path, then returned 409 when a requested shared asset reduced the result count; the eligible registry row remained deleting_at while its object was never removed. The handler now removes the eligible subset and reports preserved live references.
