---
id: 01KZRV6GKEJVSEYGBTJXWRTZPR
kind: event
event_kind: finding
created: 2026-08-11T16:41:24Z
created_by: a-slice-auditor-m6eb9n
about: "[[001]]"
origin: agent
applied: false
---
USE_CONSOLIDATED_SETTINGS is fully inert: service is booted but never read

consolidatedSettingsService.ts + settingsAdapter.ts (~527 LOC) are instantiated only in main.ts:118 (initializeSettingsAdapter) and provided as injection key at main.ts:120 (app.provide('settingsAdapter', adapter)). Whole-repo grep: NO component ever inject()s 'settingsAdapter' and useSettingsAdapter() is called nowhere (settingsAdapter.ts:323 is dead export). ConsolidatedSettingsService is imported only by settingsAdapter.ts + its test. Meanwhile ALL real settings I/O flows legacy: useSettings.ts:2/8 -> stores/settingsStore.ts -> localStorage keys (bashnota-settings, editor-settings, ...). MIGRATION STATUS for acceptance: (a) consolidatedSettingsService COVERS only a 6-key schema (editor/appearance/ai/keyboard/integrations/advanced, consolidatedSettingsService.ts:9-36) behind a localStorage backend (settingsAdapter.ts:22-43) -- it never touches the FileSystem backend despite the file header claiming 'file-based'. (b) settingsStore (legacy) OWNS everything the UI actually reads/writes plus export/import/auto-save/toast. (c) MISSING before flag could default true: no component reads the adapter at all, no read-path parity, adapter.loadSettings maps SettingsSchema->AllSettings via 'as unknown as AllSettings' (settingsAdapter.ts:113) with incompatible shapes (schema has no textColor/wordWrap/etc.), and there is no data migration from the live bashnota-settings key. Flipping the flag today changes only a console.log (main.ts:121).
