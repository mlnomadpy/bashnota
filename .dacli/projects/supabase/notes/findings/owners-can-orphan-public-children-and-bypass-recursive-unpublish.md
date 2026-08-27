---
id: f-owners-can-orphan-public-children-and-bypass-recursive-unpublish
kind: note
note_kind: finding
created: 2026-08-14T01:25:43Z
created_by: a-root
about: "[[t-01KZYG4W01FYGE10ZF3X9D5CXD]]"
severity: major
---
# Owners can orphan public children and bypass recursive unpublish
unpublish_nota traverses edge rows, but owners can directly delete/omit edges while child.parent_id still points to root. Revoke direct edge mutation or recurse canonical parent_id and adversarially test delete/republish-omit then unpublish.
