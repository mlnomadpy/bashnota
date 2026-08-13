---
id: f-notebook-runtime-selected-the-general-ai-actions-store-and-discarded-code
kind: note
note_kind: finding
created: 2026-08-13T14:34:21Z
created_by: a-codex-fixer-71x5hx
about: "[[002]]"
severity: major
---
# Notebook runtime selected the general AI actions store and discarded code-action behavior
Both factories register Pinia id 'aiActions' at src/features/ai/stores/aiActionsStore.ts:7 and src/features/editor/stores/aiActionsStore.ts:69. On notebook screens, BlockCommandMenu is the parent of NotaEditor (src/features/nota/views/NotaView.vue:164-181; src/features/nota/components/NotaPane.vue:37-53), and BlockCommandMenu creates the general store at src/features/editor/components/ui/BlockCommandMenu.vue:126 before descendant executable-code composables create the editor store (src/features/editor/components/blocks/executable-code-block/ai/composables/useAIActions.ts:27; useAIChat.ts:24). Pinia therefore returns the existing general store to those descendants, silently losing editor-only state/provider settings and executeCustomAction/isProviderConfigured methods defined at src/features/editor/stores/aiActionsStore.ts:487-623. The collision is first-use dependent: entering Code Actions settings first creates the editor store at src/features/settings/components/ai/ImprovedAICodeActionsSettings.vue:22, after which general AI Actions consumers instead lose actions/isLoaded/updateAction APIs from src/features/ai/stores/aiActionsStore.ts:153-174.
