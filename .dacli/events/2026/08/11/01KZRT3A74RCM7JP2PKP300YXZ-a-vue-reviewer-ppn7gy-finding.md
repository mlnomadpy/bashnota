---
id: 01KZRT3A74RCM7JP2PKP300YXZ
kind: event
event_kind: finding
created: 2026-08-11T16:22:11Z
created_by: a-vue-reviewer-ppn7gy
about: "[[t-01KZRSXR2NWWQWDQXHT68B2EGW]]"
origin: src/features/editor/components/blocks/executable-code-block/CodeMirror.vue:207
applied: true
---
CodeMirror MutationObserver never disconnected on unmount

onMounted creates a MutationObserver on document.documentElement (line 207, observe at 215) as a LOCAL const, never stored. onUnmounted (line 227-231) only calls darkModeMediaQuery.removeEventListener, never observer.disconnect(). CodeMirror is instantiated once per executable code block (heavily used editor surface), so every code block that mounts/unmounts leaks a live observer watching the whole document for class attribute changes. Fix: store observer in a ref and call observer.disconnect() in onUnmounted.
