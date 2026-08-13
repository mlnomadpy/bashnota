---
id: f-pm-006-is-a-live-editor-foundation-cutover-not-dependency-cleanup
kind: note
note_kind: finding
created: 2026-08-13T16:32:55Z
created_by: a-root
about: "[[006-phase-5-remove-tiptap-and-promote-prosemirror-to-direct-dependencies]]"
severity: major
scope: project
---
# PM-006 is a live editor foundation cutover, not dependency cleanup
Discovery on 2026-08-13 found 66 source files importing @tiptap, including NotaEditor with 60+ direct Editor API usages and extension wrappers built with Extension.create. Re-estimated from 2/3/6 to 8/13/21 and escalated from Terra to Sol before edits.
