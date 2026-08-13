---
id: f-verified-intended-ai-actions-store-import-map-after-collision-fix
kind: note
note_kind: finding
created: 2026-08-13T14:36:28Z
created_by: a-codex-fixer-71x5hx
about: "[[002]]"
severity: minor
---
# Verified intended AI-actions store import map after collision fix
General action consumers still resolve to src/features/ai/stores/aiActionsStore.ts (id aiActions): settings AIActionsSettings.vue:263, ImprovedAIActionsSettings.vue:16, components/AIActionDialog.vue:25; editor BlockCommandMenu.vue:26. Code-action consumers resolve to src/features/editor/stores/aiActionsStore.ts (id editorAiActions): settings AICodeActionsSettings.vue:3, ImprovedAICodeActionsSettings.vue:18, AIProvidersSettings.vue:3, components/CodeActionDialog.vue:37, components/WebLLMProviderSettingsContent.vue:366; editor executable-code composables useAIActions.ts:2 and useAIChat.ts:2. Type-only editor-store imports remain at settings CodeActionCard.vue:15, ImprovedAICodeActionsSettings.vue:19, AICodeActionsSettings.vue:4, CodeActionDialog.vue:38 and editor AIErrorAnalyzer.vue:18/useAIActions.ts:3. Whole-repo rg found no stale runtime useAIActionsStore import from the editor store.
