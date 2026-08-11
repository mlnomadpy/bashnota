---
id: f-blockid-prop-drilled-through-4-executable-code-block-layers
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-vue-reviewer-ppn7gy
about: "[[t-01KZRSXR2NWWQWDQXHT68B2EGW]]"
origin: src/features/editor/components/blocks/executable-code-block/ExecutableCodeBlock.vue:457
source_event: 01KZRTFAW8NGAFJP1RXG9JD6A2
---
# blockId prop drilled through 4 executable-code-block layers
blockId is declared in defineProps and re-bound down 4 nested components only to reach leaf consumers: ExecutableCodeBlock.vue:457 -> CodeBlockWithExecution.vue:495 -> FullScreenCodeBlock.vue:417 -> components/OutputSection.vue:226 (then to OutputRenderer :207 and AICodeAssistantContainer :226). Every intermediate layer redeclares the prop just to pass it through. Fix: provide('blockId') at ExecutableCodeBlock + inject at the deep consumers, or read it from the codeExecution Pinia store which already keys cells by id.
