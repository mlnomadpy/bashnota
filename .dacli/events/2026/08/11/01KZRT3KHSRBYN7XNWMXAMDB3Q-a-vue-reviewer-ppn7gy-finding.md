---
id: 01KZRT3KHSRBYN7XNWMXAMDB3Q
kind: event
event_kind: finding
created: 2026-08-11T16:22:20Z
created_by: a-vue-reviewer-ppn7gy
about: "[[t-01KZRSXR2NWWQWDQXHT68B2EGW]]"
origin: src/features/ai/components/components/AIAssistantSidebar.vue:568
applied: true
---
AIAssistantSidebar leaks window activate-ai-assistant listener on every unmount

onMounted registers window.addEventListener('activate-ai-assistant', ...) at line 568 with an inline anonymous handler (cast as EventListener) capturing component state (activeAIBlock, conversationHistory). onBeforeUnmount (643-651) removes only the 'mousedown' listener and clears webLLMStateInterval; the 'activate-ai-assistant' listener is NEVER removed and cannot be (no reference kept). Each remount stacks another live handler, so one dispatched event fires N stale closures mutating dead component state. Fix: hoist to a named handler and removeEventListener in onBeforeUnmount.
