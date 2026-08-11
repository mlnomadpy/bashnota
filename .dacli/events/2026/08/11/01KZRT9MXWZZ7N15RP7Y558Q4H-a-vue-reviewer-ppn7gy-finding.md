---
id: 01KZRT9MXWZZ7N15RP7Y558Q4H
kind: event
event_kind: finding
created: 2026-08-11T16:25:39Z
created_by: a-vue-reviewer-ppn7gy
about: "[[t-01KZRSXR2NWWQWDQXHT68B2EGW]]"
origin: src/features/ai/stores/aiActionsStore.ts:7
applied: true
---
Two different stores registered with the same Pinia id aiActions

Both src/features/ai/stores/aiActionsStore.ts:7 and src/features/editor/stores/aiActionsStore.ts:69 call defineStore('aiActions', ...) and both export useAIActionsStore. Pinia caches stores by id, so only ONE 'aiActions' instance can exist at runtime; whichever useAIActionsStore() runs first wins and the other file's setup never executes. The two own DIFFERENT shapes — ai/ holds actions: AIAction[] (enabled/custom/default lists persisted to localStorage 'ai-actions'); editor/ holds a reactive state with customActions, providerSettings, errorTriggerConfig. A consumer importing the editor version but hitting the cached ai version (or vice-versa) silently gets the wrong store shape. Fix: rename one id (e.g. 'editorAiActions') and its export, or merge them.
