---
id: 01KZRT41VSMC90F8D3DZDBS6R5
kind: event
event_kind: finding
created: 2026-08-11T16:22:35Z
created_by: a-vue-reviewer-ppn7gy
about: "[[t-01KZRSXR2NWWQWDQXHT68B2EGW]]"
origin: src/features/editor/components/NotaContentViewer.vue:247
applied: true
---
NotaContentViewer polling interval not cleared if component unmounts before editor ready

onMounted starts setInterval polling editor.value every 100ms (247). clearInterval is only called INSIDE the callback once editor.value is truthy (250). If the component unmounts before the editor initializes, the interval is never cleared — no onUnmounted guard. Fix: store the id and clearInterval in onUnmounted.
