---
id: 01KZRV6MH1SXBXW6XXP4KTV2XH
kind: event
event_kind: finding
created: 2026-08-11T16:41:28Z
created_by: a-slice-auditor-qaywna
about: "[[001]]"
origin: agent
applied: false
---
PROVIDER MAP + feature grades for the AI slice

PROVIDERS (src/features/ai/services/providers/): gemini (streaming + multimodal, key required), ollama (local, no key), webllm (in-browser WebGPU, no key). All three are wired: registered in DefaultProviderFactory.createProvider (providerFactory.ts:26-40), advertised by getAvailableProviders (providerFactory.ts:70-96), and surfaced in Settings > AI Providers. NO provider is defined-but-unreachable; no Anthropic/OpenAI provider exists. FEATURE GRADES: (1) Conversations = COMPLETE -- aiConversationStore + aiConversationService + useConversation/useConversationManager/useChatHistory, persisted to Dexie db.conversations, driven by the sidebar. (2) Assistant sidebar (989 LOC) = COMPLETE/wired via src/components/RightSidebarContainer.vue -> App.vue, but carries listener/interval leaks (vue seat 01KZRT3KHS, 01KZRTK6CP). (3) WebLLM in-browser inference = COMPLETE functionally (webLLMProvider + webLLMDefaultModelService auto-select), but eagerly bundled (see 4.8MB finding). (4) Generation blocks = COMPLETE -- 'aiGeneration' TipTap node driven by useAIGeneration.ts, with export support (MarkdownParserService, ExportDialog). (5) AI code/text Actions = PARTIAL -- executeAction works (useAIActions.ts:13) but undermined by the 'aiActions' store-id collision. (6) Gemini multimodal (images) = PARTIAL/likely-ORPHANED -- generateMultimodal implemented (geminiProvider.ts:119) but I found no UI path that populates options.images; grep for image-passing callers came back empty within the slice.
