---
id: 01KZRTH2PRSBW5YV9H3H3MM455
kind: event
event_kind: finding
created: 2026-08-11T16:29:42Z
created_by: a-vue-reviewer-ppn7gy
about: "[[t-01KZRSXR2NWWQWDQXHT68B2EGW]]"
origin: src/features/editor/components/blocks/executable-code-block/ExecutableCodeBlock.vue:238
applied: true
---
availableKernels computed contains console.log side effects

The availableKernels computed (238-249) runs three console.log calls (241, 246, 247) inside its getter. A computed must be a pure read; these logs fire on every re-evaluation/access, are noisy in production, and signal debugging left in place. Fix: remove the logs (or move to a watch if logging on change is truly wanted).
