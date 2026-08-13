---
id: f-duplicate-aiactions-winner-was-route-order-dependent-stores-now-have-distinct
kind: note
note_kind: finding
created: 2026-08-13T14:35:30Z
created_by: a-root
about: "[[002]]"
severity: major
origin: src/features/editor/stores/aiActionsStore.ts:69
---
# Duplicate aiActions winner was route-order dependent; stores now have distinct ids
Pinia caches stores by id, so the first composable invoked won the old shared `aiActions` id. On editor routes, BlockCommandMenu.vue instantiated the general src/features/ai store first; on provider/code-action settings routes, the editor store could win first. The losing store then exposed the winner's incompatible state. The fix keeps `useAIActionsStore`/`aiActions` for AIActionsSettings.vue, ImprovedAIActionsSettings.vue, AIActionDialog.vue, and BlockCommandMenu.vue; it renames the editor export/id to `useEditorAIActionsStore`/`editorAiActions` for AICodeActionsSettings.vue, ImprovedAICodeActionsSettings.vue, AIProvidersSettings.vue, CodeActionDialog.vue, WebLLMProviderSettingsContent.vue, useAIActions.ts, and useAIChat.ts. Vite build and 347 Vitest tests pass.
