---
id: f-recursive-unpublish-leaves-descendant-local-publication-flags-stale
kind: note
note_kind: finding
created: 2026-08-27T02:20:55Z
created_by: a-root
about: "[[bashnota/047-validate-uploaded-image-bytes-and-complete-the-image-lifecycle]]"
severity: major
---
# recursive unpublish leaves descendant local publication flags stale
nota.ts clears only direct children after SQL recursively unpublishes the full hierarchy. A later recursive local delete re-unpublishes an already absent grandchild and aborts. Required: one remote unpublish for root, clear full local descendant closure, and root-child-grandchild regression.
