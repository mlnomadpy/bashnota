---
id: 01KZRV5A073C0KQ2DYB7BENBV5
kind: event
event_kind: finding
created: 2026-08-11T16:40:45Z
created_by: a-slice-auditor-qaywna
about: "[[001]]"
origin: agent
applied: false
---
web-llm (~4.8MB) is in the entry graph for every user; exact ai-slice import chain

Confirms perf seat 01KZRT661F and localizes the mechanism inside this slice. Boot chain: src/main.ts:64 side-effect-imports the settings store -> src/features/ai/stores/aiSettingsStore.ts:3 imports aiService -> the AIService singleton is instantiated at module load (src/features/ai/services/aiService.ts:320) -> aiService.ts:14 AND providerFactory.ts:4 statically import WebLLMProvider -> src/features/ai/services/providers/webLLMProvider.ts:1 does import-star from @mlc-ai/web-llm. There is no dynamic import() anywhere in the slice. USER-VISIBLE: every user -- including those who only use Gemini/Ollama or no AI at all -- downloads the ~4.8MB WebLLM runtime as part of the single ~10MB main chunk. CHEAP FIX specific to this slice: only providerFactory.createProvider (case webllm) and aiService.getProvider reference WebLLMProvider, so converting webLLMProvider.ts to a lazy dynamic import of @mlc-ai/web-llm inside initializeModel/generate methods removes it from the entry graph with a ~10-line change and no public API change.
