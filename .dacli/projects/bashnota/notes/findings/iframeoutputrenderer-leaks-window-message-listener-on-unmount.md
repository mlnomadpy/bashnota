---
id: f-iframeoutputrenderer-leaks-window-message-listener-on-unmount
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-vue-reviewer-ppn7gy
about: "[[t-01KZRSXR2NWWQWDQXHT68B2EGW]]"
origin: src/features/editor/components/blocks/executable-code-block/IframeOutputRenderer.vue:169
source_event: 01KZRT3KJ23KNNZT2A6HFW0WTB
---
# IframeOutputRenderer leaks window message listener on unmount
onMounted (168-173) calls window.addEventListener('message', handleMessage). There is no onUnmounted/onBeforeUnmount in the component, so the message listener leaks on every unmount. handleMessage references iframeRef so stale closures accumulate; every code-output iframe that mounts/unmounts adds a permanent global message handler. Fix: add onUnmounted(() => window.removeEventListener('message', handleMessage)).
