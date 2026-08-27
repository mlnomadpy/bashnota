---
id: f-valid-extended-webp-is-rejected-before-normalization
kind: note
note_kind: finding
created: 2026-08-27T11:11:01Z
created_by: a-root
about: "[[bashnota/047-validate-uploaded-image-bytes-and-complete-the-image-lifecycle]]"
severity: moderate
origin: supabase/functions/_shared/imageValidation.ts:123
---
# Valid extended WebP is rejected before normalization
Independent exact-head review generated valid transparent VP8X+ALPH+VP8 WebP and reproduced rejection in validateRaster and the real Edge endpoint. Repair requires bounded RIFF chunk walking for valid extended layouts plus malformed-layout and real Edge regressions.
