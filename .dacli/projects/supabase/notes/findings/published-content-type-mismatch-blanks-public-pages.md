---
id: f-published-content-type-mismatch-blanks-public-pages
kind: note
note_kind: finding
created: 2026-08-14T01:25:43Z
created_by: a-root
about: "[[t-01KZYG4W01FYGE10ZF3X9D5CXD]]"
severity: major
---
# Published content type mismatch blanks public pages
Publishing/adapters preserve jsonb content as object, but NotaContentViewer and PublicNotaView unconditionally JSON.parse it. Normalize boundary consistently and mount publish-read-render for Firebase/Supabase.
