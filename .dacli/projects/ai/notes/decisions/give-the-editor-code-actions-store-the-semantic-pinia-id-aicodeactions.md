---
id: d-give-the-editor-code-actions-store-the-semantic-pinia-id-aicodeactions
kind: note
note_kind: decision
created: 2026-08-13T14:34:21Z
created_by: a-codex-fixer-71x5hx
about: "[[002]]"
---
# Give the editor code-actions store the semantic Pinia id aiCodeActions
## Chose
Give the editor code-actions store the semantic Pinia id aiCodeActions
## Rejected
Merge the two stores or rename their exported useAIActionsStore symbols and all consumers
## Because
The stores have incompatible state, persistence keys, and public APIs (src/features/ai/stores/aiActionsStore.ts:7-176 versus src/features/editor/stores/aiActionsStore.ts:69-697). Changing only the internal Pinia id separates their instances while preserving every existing import and exported API.
