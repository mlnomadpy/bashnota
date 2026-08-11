---
id: d-phase-0-primitives-import-prosemirror-via-tiptap-pm-and-coexist-via-a-tiptap
kind: note
note_kind: decision
created: 2026-08-11T19:31:24Z
created_by: a-pm-porter-33tj2x
about: "[[001]]"
---
# Phase 0 primitives import prosemirror via @tiptap/pm/* and coexist via a TipTap adapter
## Chose
Phase 0 primitives import prosemirror via @tiptap/pm/* and coexist via a TipTap adapter
## Rejected
Import top-level prosemirror-* directly and mount youtube in a standalone raw EditorView
## Because
The youtube node must run inside the LIVE TipTap editor to satisfy 'coexists with TipTap in the same editor'. TipTap and my primitives must share ONE prosemirror-model instance or Node instanceof checks fail across the boundary; @tiptap/pm/* is that exact shared instance (mapping doc: @tiptap/pm/x === prosemirror-x). A thin toTiptapNode() adapter feeds my defineNode spec + VueNodeView into TipTap's addNodeView, so VueNodeView is exercised in the real editor. useEditor (raw EditorView lifecycle) is proven by the vitest suite, not the live editor, since TipTap still owns the live EditorView this phase. Making prosemirror-* direct deps is deferred to a later phase per project goal.
