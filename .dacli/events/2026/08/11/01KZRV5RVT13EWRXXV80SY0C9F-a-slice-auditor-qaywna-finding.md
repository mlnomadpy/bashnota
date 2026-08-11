---
id: 01KZRV5RVT13EWRXXV80SY0C9F
kind: event
event_kind: finding
created: 2026-08-11T16:41:00Z
created_by: a-slice-auditor-qaywna
about: "[[001]]"
origin: agent
applied: false
---
AI slice exposes two parallel service facades; settings uses the legacy shim

The slice's public service is @/features/ai/services (aiService singleton). A second 308-LOC facade at src/services/aiService.ts wraps that same singleton (it imports { aiService as newAIService } from @/features/ai/services on line 1). It is NOT dead: whole-repo grep shows live importers src/features/settings/components/ai/AIProvidersSettings.vue and src/features/editor/stores/aiActionsStore.ts (plus the already-dead root localagents.ts). USER-VISIBLE: none directly, but the AI Providers settings panel and the editor code-actions store talk to the AI slice through a different, thicker facade than the assistant sidebar/composables do, duplicating provider-config and generation types (LLMProvider, GeminiSafetySettings re-declared at src/services/aiService.ts:15,24). Maintenance hazard: changes to the slice's types must be mirrored in the shim or the two drift.
