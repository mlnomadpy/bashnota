---
id: f-no-markraw-shallowref-shallowreactive-anywhere-in-the-codebase
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-vue-reviewer-ppn7gy
about: "[[t-01KZRSXR2NWWQWDQXHT68B2EGW]]"
origin: src/features/editor/stores/editorStore.ts:7
source_event: 01KZRT6P2DQ3KX5A0N4WNJMMRP
---
# No markRaw/shallowRef/shallowReactive anywhere in the codebase
grep across all .vue/.ts finds ZERO uses of markRaw, shallowRef, or shallowReactive in ~120k LOC. The app stores many large non-plain objects in deep-reactive refs/state: TipTap Editor (editorStore.ts:7), CodeMirror EditorView (CodeMirror.vue:43), and the nota store's items array of full Nota trees (nota.ts:126). Every one is deep-proxied by Vue. The total absence of shallow-reactivity primitives is a systemic reactivity-perf smell — large external objects (ProseMirror/CodeMirror views, Jupyter kernel handles) should be markRaw'd. Recommend an audit pass introducing shallowRef/markRaw for all non-plain-data refs.
