---
id: 01KZRV76D45DX557MEFPD9VWZT
kind: event
event_kind: finding
created: 2026-08-11T16:41:47Z
created_by: a-slice-auditor-m6eb9n
about: "[[001]]"
origin: agent
applied: false
---
Dead code: the two ORIGINAL AI settings components (1316 LOC incl. the slice's largest file) are superseded and unreachable

SettingsPanel.vue is the only runtime resolver of settings panels. Its componentMap remaps the registry keys 'AIActionsSettings' -> ImprovedAIActionsSettings.vue (SettingsPanel.vue:41) and 'AICodeActionsSettings' -> ImprovedAICodeActionsSettings.vue (line 42). Whole-repo grep for path imports of ai/AIActionsSettings.vue and ai/AICodeActionsSettings.vue returns ONLY components/ai/README.md (docs) -- zero code importers. Therefore AIActionsSettings.vue (373 LOC) and AICodeActionsSettings.vue (943 LOC, the LARGEST file in the whole settings slice) are dead: the Improved* variants replaced them but the originals were never deleted. Safe to remove once README.md:73 is updated. This is the single biggest LOC win in the slice.
