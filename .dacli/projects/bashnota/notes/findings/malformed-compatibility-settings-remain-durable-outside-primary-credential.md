---
id: f-malformed-compatibility-settings-remain-durable-outside-primary-credential
kind: note
note_kind: finding
created: 2026-08-27T11:50:21Z
created_by: a-root
about: "[[048]]"
severity: moderate
scope: project
origin: src/features/editor/stores/aiActionsStore.ts:408
---
# Malformed compatibility settings remain durable outside primary credential stores
Fresh final review found aiActionsStore wraps three JSON loads in one catch but deletes none, so malformed ai-code-preferences containing legacy credentials survives. settingsAdapter consolidated migration and old-mode category/theme/interface loaders likewise retain malformed opaque artifacts. Repair every compatibility key by parsing independently and deleting the exact malformed key before continuing; add sentinel regressions covering ai-code-preferences and adapter legacy categories. Primary ai-settings/jupyter stores are already correct.
