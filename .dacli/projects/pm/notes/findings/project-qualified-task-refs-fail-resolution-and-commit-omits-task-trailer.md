---
id: f-project-qualified-task-refs-fail-resolution-and-commit-omits-task-trailer
kind: note
note_kind: finding
created: 2026-08-13T17:15:26Z
created_by: a-root
about: "[[006-phase-5-remove-tiptap-and-promote-prosemirror-to-direct-dependencies]]"
severity: moderate
scope: workspace
---
# Project-qualified task refs fail resolution and commit omits task trailer
During PM-006 commit, dacli's ambiguity guidance supplied a project-qualified task ref that was not resolvable; commit ad607bc succeeded but silently omitted the Dacli-Task trailer even though the event recorded the task literal. Agent attempted dacli report, but gh is unauthenticated so upstream filing is blocked. Inspect commit/event handling before relying on trailers.
