---
id: 01KZRTH2Q1GPAHKDR6JHQQRYRT
kind: event
event_kind: finding
created: 2026-08-11T16:29:42Z
created_by: a-vue-reviewer-ppn7gy
about: "[[t-01KZRSXR2NWWQWDQXHT68B2EGW]]"
origin: src/features/ai/components/composables/useAIRequest.ts:14
applied: true
---
Watch used where a computed belongs in useAIRequest

The watch handler at line 14 only assigns timeout.value as a pure derivation of settings.requestTimeout (x1000 or a DEFAULT), and timeout is never written anywhere else. This is a derived value and should be a computed(() => ...), avoiding an extra ref + watcher and the initial-sync problem. Fix: replace the ref+watch with a computed.
