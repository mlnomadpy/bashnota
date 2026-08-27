---
id: f-filesystem-mode-stores-metadata-while-canonical-bodies-remain-browser-local
kind: note
note_kind: finding
created: 2026-08-19T14:38:34Z
created_by: a-root
about: "[[012]]"
severity: major
---
# Filesystem mode stores metadata while canonical bodies remain browser-local
src/services/fileSystemBackend.ts:128-150 writes only Nota metadata; src/services/storageService.ts:21-34 has no block-content API; production activates filesystem mode at src/main.ts:93-96. Moving the directory to a fresh browser restores blank notes.
