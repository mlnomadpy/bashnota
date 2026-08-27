---
id: f-image-cleanup-can-delete-an-asset-concurrently-published
kind: note
note_kind: finding
created: 2026-08-27T02:15:29Z
created_by: a-root
about: "[[bashnota/047-validate-uploaded-image-bytes-and-complete-the-image-lifecycle]]"
severity: major
---
# image cleanup can delete an asset concurrently published
Independent two-session reproduction at 956cd5b: cleanup claim held open while authenticated publication committed; final state had deleting_at=true and one live published_image_reference. Edge Function then proceeds to storage deletion. SQL claim and publication trigger do not establish a shared row-lock protocol.
