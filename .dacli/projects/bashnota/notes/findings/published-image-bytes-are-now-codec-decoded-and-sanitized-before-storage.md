---
id: f-published-image-bytes-are-now-codec-decoded-and-sanitized-before-storage
kind: note
note_kind: finding
created: 2026-08-27T10:38:26Z
created_by: a-supabase-implementer-3v0cpm
about: "[[t-01M10BZYS4VYEQJ5C7BVE438XZ]]"
severity: major
---
# Published image bytes are now codec-decoded and sanitized before Storage
supabase/functions/_shared/imageSanitization.ts:20-36 validates the declared format, decodes with pinned ImageMagick WASM, verifies decoded dimensions, strips metadata, re-encodes to PNG, and revalidates the stored result; supabase/tests/storage/published-images.integration.mjs:44-110 proves PNG/JPEG/GIF/WebP acceptance plus forged MIME, active bytes, malformed base64, corrupt PNG, header-only GIF, size, ownership, explicit deletion, reference preservation, and recent-orphan preservation through a publishable-key client. Full Supabase suite passed 270 pgTAP assertions and all browser integrations.
