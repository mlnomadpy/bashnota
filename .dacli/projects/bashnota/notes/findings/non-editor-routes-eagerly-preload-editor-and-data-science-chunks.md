---
id: f-non-editor-routes-eagerly-preload-editor-and-data-science-chunks
kind: note
note_kind: finding
created: 2026-08-19T14:38:34Z
created_by: a-root
about: "[[013]]"
severity: major
---
# Non-editor routes eagerly preload editor and data-science chunks
Current dist/index.html preloads editor, D3, KaTeX, and Vue Flow for every route due root imports/global dialogs in src/App.vue; CI caps only the entry file, not the initial preload graph.
