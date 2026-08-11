---
id: 01KZRV7NBTKMNJH1VEXFKCP3AB
kind: event
event_kind: finding
created: 2026-08-11T16:42:02Z
created_by: a-slice-auditor-m6eb9n
about: "[[001]]"
origin: agent
applied: false
---
Keyboard settings persist to a different store than the schema claims; SettingsSchema.keyboard.shortcuts is dead data

The keyboard settings panels edit shortcuts via a SEPARATE store: EditorShortcutsSettings.vue:11 imports useShortcutsStore from stores/shortcutsStore and calls shortcutsStore.updateShortcut (line 44). Meanwhile the consolidated schema declares keyboard.shortcuts (consolidatedSettingsService.ts:25-27) and the legacy AllSettings has a keyboard category persisted to localStorage 'keyboard-settings' (settingsStore + settingsAdapter). Whole-repo grep for 'keyboard-settings' consumers returns only settingsStore.ts and settingsAdapter.ts -- NOTHING reads it to register shortcuts. So the keyboard category in BOTH settings systems is write-only dead data; the real, applied shortcut state lives in shortcutsStore. This is a mapping gap for the 'which settings actually persist/affect behaviour' acceptance item: keyboard-category settings persist but affect nothing.
