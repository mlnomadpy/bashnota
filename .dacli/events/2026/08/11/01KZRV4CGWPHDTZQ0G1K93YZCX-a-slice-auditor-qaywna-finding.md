---
id: 01KZRV4CGWPHDTZQ0G1K93YZCX
kind: event
event_kind: finding
created: 2026-08-11T16:40:15Z
created_by: a-slice-auditor-qaywna
about: "[[001]]"
origin: agent
applied: false
---
API key change silently ignored: provider cache is never evicted

providerFactory.createProvider() returns the cached instance and ignores its config arg on every call after the first (src/features/ai/services/providerFactory.ts:16-19). The only eviction method, removeProvider() (providerFactory.ts:65), has ZERO callers (whole-repo grep). aiSettingsStore.setApiKey() only writes localStorage (src/features/ai/stores/aiSettingsStore.ts:57-63); it never resets the factory. GeminiProvider bakes the key into the instance at construction (geminiProvider.ts:34-36). USER-VISIBLE: once the Gemini provider has been created once in a session, editing the API key in Settings has NO effect until a full page reload -- a user who pastes a corrected/renewed key keeps getting 401s. Same root cause breaks Ollama server-URL and model changes (providerFactory.ts:35; aiService.setDefaultModel routes to the same cached instance).
