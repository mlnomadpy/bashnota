---
id: f-mixed-referenced-image-deletion-strands-removable-assets
kind: note
note_kind: finding
created: 2026-08-27T02:15:29Z
created_by: a-root
about: "[[bashnota/047-validate-uploaded-image-bytes-and-complete-the-image-lifecycle]]"
severity: major
---
# mixed referenced image deletion strands removable assets
Unpublishing a nota with one shared and one unique image returns both paths. claim_unreferenced marks the unique path deleting, but Edge Function returns 409 when removable.length differs from requested paths, so it removes neither and leaves the unique asset permanently deleting_at.
