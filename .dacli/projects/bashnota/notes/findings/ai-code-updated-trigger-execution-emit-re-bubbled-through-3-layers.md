---
id: f-ai-code-updated-trigger-execution-emit-re-bubbled-through-3-layers
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-vue-reviewer-ppn7gy
about: "[[t-01KZRSXR2NWWQWDQXHT68B2EGW]]"
origin: src/features/editor/components/blocks/executable-code-block/ai/components/AIActionPanel.vue:60
source_event: 01KZRTFQ52W3XPEEVHG9K7TBY3
---
# AI code-updated / trigger-execution emit re-bubbled through 3 layers
The AI 'apply code' event bubbles unchanged: AIActionPanel.vue:60 -> AICodeAssistantContainer.vue:135 (bound :328) -> components/OutputSection.vue:51 (bound :232) -> FullScreenCodeBlock.vue:191 where it is renamed to update:code (bound :423). trigger-execution follows the identical 3-layer path (AICodeAssistantContainer.vue:139 -> OutputSection.vue:236 -> FullScreenCodeBlock.vue:199). Fix: route through the codeExecution store or a provide/inject updateCode callback rather than re-emitting at each layer.
