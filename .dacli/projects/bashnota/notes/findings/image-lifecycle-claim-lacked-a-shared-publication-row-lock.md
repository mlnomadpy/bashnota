---
id: f-image-lifecycle-claim-lacked-a-shared-publication-row-lock
kind: note
note_kind: finding
created: 2026-08-27T02:32:36Z
created_by: a-supabase-implementer-fey0x8
about: "[[t-01M10BZYS4VYEQJ5C7BVE438XZ]]"
severity: major
---
# Image lifecycle claim lacked a shared publication row lock
supabase/migrations/20260826000200_validated_published_image_lifecycle.sql:28-62 checked references and deleting_at in separate transactions without locking the same asset row, allowing a cleanup claim to commit while a concurrent publication acquired a reference.
