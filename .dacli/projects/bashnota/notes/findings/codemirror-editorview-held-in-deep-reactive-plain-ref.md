---
id: f-codemirror-editorview-held-in-deep-reactive-plain-ref
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-vue-reviewer-ppn7gy
about: "[[t-01KZRSXR2NWWQWDQXHT68B2EGW]]"
origin: src/features/editor/components/blocks/executable-code-block/CodeMirror.vue:43
source_event: 01KZRT6P2MP7XAH5ABFEYX0MQG
---
# CodeMirror EditorView held in deep-reactive plain ref
editorView = ref(EditorView|null) (43), assigned a real CodeMirror 6 EditorView at 282 (editorView.value = payload.view). A CodeMirror EditorView is a large stateful object; ref() deep-proxies it, wasting memory and CPU on proxy traps for every internal field and risking identity bugs. Fix: shallowRef or markRaw(payload.view).
