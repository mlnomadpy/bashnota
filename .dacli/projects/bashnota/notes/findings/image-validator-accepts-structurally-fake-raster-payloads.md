---
id: f-image-validator-accepts-structurally-fake-raster-payloads
kind: note
note_kind: finding
created: 2026-08-27T02:20:55Z
created_by: a-root
about: "[[bashnota/047-validate-uploaded-image-bytes-and-complete-the-image-lifecycle]]"
severity: major
---
# image validator accepts structurally fake raster payloads
Direct validator evidence at 956cd5b: 14-byte GIF89a header/dimensions plus arbitrary payload/trailer and PNG with corrupted IDAT/CRC are accepted. Require authoritative decode/re-encode or complete format validation, with corrupt PNG, no-frame GIF, malformed JPEG entropy, and invalid WebP regressions.
