---
id: 01KZRV5HEYAAFYYY6754T079ME
kind: event
event_kind: finding
created: 2026-08-11T16:40:52Z
created_by: a-slice-auditor-qaywna
about: "[[001]]"
origin: agent
applied: false
---
Pinia store-id collision 'aiActions' silently merges two unrelated AI stores

src/features/ai/stores/aiActionsStore.ts:7 and src/features/editor/stores/aiActionsStore.ts:69 BOTH call defineStore('aiActions', ...). Pinia caches stores by id, so the first useAIActionsStore() call to run wins and every later call anywhere returns that same instance regardless of which module it imported from. The two stores have different shapes/data: the ai-slice store holds text-processing AI Actions (settings panel src/features/settings/components/ai/AIActionsSettings.vue) while the editor store holds code actions (settings panel src/features/settings/components/ai/AICodeActionsSettings.vue). USER-VISIBLE: whichever settings panel is opened second reads/writes the wrong store -- custom actions, enable/disable toggles, and localStorage keys ('ai-actions' vs the editor key) get crossed. Extends the vue seat's generic report 01KZRT9MXW with the concrete ai-slice consequence and the two settings entry points.
