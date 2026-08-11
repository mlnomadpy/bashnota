---
id: d-remove-tiptap-entirely-and-build-directly-on-prosemirror
kind: note
note_kind: decision
created: 2026-08-11T17:48:11Z
created_by: a-root
---
# Remove TipTap entirely and build directly on ProseMirror
## Chose
Remove TipTap entirely and build directly on ProseMirror
## Rejected
keep TipTap and use @tiptap/pm for the parts needing raw ProseMirror control
## Because
OWNER DECISION by the repo owner, made after being shown the counter-analysis, and it stands.

Owner rationale: TipTap constrains control over the app, and its value does not justify the dependency when the premium tier is not in use. Owner wants a cleaner codebase they fully own.

Root recorded the following counter-analysis at the time, so the tradeoff being accepted is on the record and is not re-litigated later:
- TipTap own code is 329 KB unminified ESM vs ProseMirror 731 KB. Removing TipTap saves roughly 30-40 KB gzipped out of what was then a 3,327 KB gzipped bundle (~1%). Bundle size is NOT a valid justification, and the web-llm split has since taken the entry chunk to 552 KB gzipped anyway.
- Zero TipTap Pro/paid packages were in the dependency tree. The paid tier was never a cost being paid, so removing TipTap does not avoid a cost.
- Yjs collaboration never required TipTap Pro; y-prosemirror plugins mount through addProseMirrorPlugins.
- Cost accepted: 58 files import @tiptap/*, comprising 31 node/extension definitions (25 Node.create + 6 Extension.create), 43 parseHTML, 51 renderHTML, 22 addAttributes, 26 VueNodeViewRenderer, 29 NodeViewWrapper, 17 useEditor, 12 addCommands, 5 addProseMirrorPlugins. The Vue-to-ProseMirror node view bridge must be written and maintained in-house; it is the highest-risk component.

VALID reasons this decision does stand on: full control of schema construction, ProseMirror plugin ordering, and EditorView/node-view lifecycle — all of which TipTap owns today and none of which it exposes cleanly.

ProseMirror is NOT being removed. It is the editor. The prosemirror-* packages move from transitive (via @tiptap/pm) to direct dependencies.
