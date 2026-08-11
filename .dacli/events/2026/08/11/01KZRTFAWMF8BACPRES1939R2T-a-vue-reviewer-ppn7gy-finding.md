---
id: 01KZRTFAWMF8BACPRES1939R2T
kind: event
event_kind: finding
created: 2026-08-11T16:28:45Z
created_by: a-vue-reviewer-ppn7gy
about: "[[t-01KZRSXR2NWWQWDQXHT68B2EGW]]"
origin: src/features/editor/components/blocks/executable-code-block/ExecutableCodeBlock.vue:460
applied: true
---
notaId prop drilled through 4 executable-code-block layers

notaId (never changes) is threaded through 4 layers for a bottom-level output/URL lookup: ExecutableCodeBlock.vue:460 -> CodeBlockWithExecution.vue:496 -> FullScreenCodeBlock.vue:418 -> components/OutputSection.vue:206 -> OutputRenderer. Fix: expose via provide/inject or the nota store instead of redeclaring it in every intermediate defineProps.
