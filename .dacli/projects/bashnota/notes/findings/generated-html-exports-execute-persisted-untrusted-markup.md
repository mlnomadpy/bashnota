---
id: f-generated-html-exports-execute-persisted-untrusted-markup
kind: note
note_kind: finding
created: 2026-08-19T14:40:32Z
created_by: a-root
about: "[[011]]"
severity: major
---
# Generated HTML exports execute persisted untrusted markup
Raw titles, code output, theorem proofs, pipeline titles, and citation metadata reach string interpolation or innerHTML in src/features/editor/services/exportService.ts and export/templates/defaultTemplate.ts without a final export sanitizer. Opening the exported archive can execute stored scripts.
