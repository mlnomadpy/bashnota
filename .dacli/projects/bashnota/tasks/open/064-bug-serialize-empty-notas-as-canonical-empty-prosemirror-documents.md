---
id: t-01M1CQJ1RHENH5JFZHB3FSZXPQ
kind: task
created: 2026-08-31T20:18:19Z
created_by: a-root
owner: a-root
github:
  issue: 76
  repo: mlnomadpy/bashnota
github_acceptance_import:
  issue: 76
  body_digest: sha256:5dc4f8699660de0e1222208e2114e4b07197a683cda86a48b441742dd549a722
  actor: a-root
  imported_at: 2026-08-31T20:18:19Z
---
# Bug: serialize empty notas as canonical empty ProseMirror documents
## Context
Adopted from GitHub issue #76.

## Observed

getTiptapContent returns null when block structure/order is empty, while the editor treats a blank document as an object with type doc and empty content. Publishing and export therefore treat a valid blank nota as missing content.

Relevant areas: blockStore.ts, NotaEditor.vue, publishing, and export paths.

## Expected

A blank nota has one canonical serialized representation across editor, storage, publishing, and export.

## Acceptance criteria

- Empty content serializes as a valid empty ProseMirror document.
- Import/export round-trips preserve blank notas.
- Publishing provides an intentional product-level validation message if blank publication is disallowed.
- Tests cover new blank notas, cleared notas, legacy null content, export, and publishing.

## Acceptance
- [ ] Empty content serializes as a valid empty ProseMirror document.
- [ ] Import/export round-trips preserve blank notas.
- [ ] Publishing provides an intentional product-level validation message if blank publication is disallowed.
- [ ] Tests cover new blank notas, cleared notas, legacy null content, export, and publishing.
## Log
