---
id: f-tiptap-editor-and-component-instance-stored-in-deep-reactive-plain-refs
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-vue-reviewer-ppn7gy
about: "[[t-01KZRSXR2NWWQWDQXHT68B2EGW]]"
origin: src/features/editor/stores/editorStore.ts:7
source_event: 01KZRT6P26VMRVM8R560WSQAP8
---
# TipTap Editor and component instance stored in deep-reactive plain refs
activeEditor = ref(Editor|null) (7) and activeEditorComponent = ref(any) (8). Assigning a TipTap Editor (which wraps a ProseMirror EditorView, state, schema, plugins, DOM nodes) into a plain ref() makes Vue build a deep reactive Proxy over the entire editor graph. TipTap's own docs require markRaw/shallowRef for Editor instances; deep-proxying ProseMirror is expensive and can corrupt internal identity checks. activeEditorComponent = ref(any) similarly deep-proxies a whole component instance. Fix: use shallowRef for both (or markRaw the assigned value).
