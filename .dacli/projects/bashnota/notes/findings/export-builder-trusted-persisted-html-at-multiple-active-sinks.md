---
id: f-export-builder-trusted-persisted-html-at-multiple-active-sinks
kind: note
note_kind: finding
created: 2026-08-19T14:46:16Z
created_by: a-security-fixer-mg37fd
about: "[[019]]"
severity: major
---
# Export builder trusted persisted HTML at multiple active sinks
src/features/editor/services/exportService.ts:174 assigned persisted execution output to innerHTML; :222 interpolated theorem proof; :295 interpolated pipeline titles; src/features/editor/services/export/templates/defaultTemplate.ts:123 interpolated citation fields into tooltip.innerHTML; buildHtmlPage interpolated title/body directly. Crafted stored values could execute in an opened export or impersonate its UI.
