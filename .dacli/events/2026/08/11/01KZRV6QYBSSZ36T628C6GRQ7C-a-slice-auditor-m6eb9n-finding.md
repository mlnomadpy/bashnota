---
id: 01KZRV6QYBSSZ36T628C6GRQ7C
kind: event
event_kind: finding
created: 2026-08-11T16:41:32Z
created_by: a-slice-auditor-m6eb9n
about: "[[001]]"
origin: agent
applied: false
---
Command palette routes to 6 removed sections -> silently shows wrong panel (TextEditingSettings) with blank title

SettingsCommandPalette.vue lists sections with ids text-editing(53), code-editing(62), formatting(72), theme(94), interface(104), performance(178). Selecting one emits navigate -> SettingsView.vue:43 handleCommandNavigation -> selectSetting(id) -> router.push section=id. But those ids are commented out of the settingsCategories registry (SettingsView.vue:62-64,74-75,87-88 and PerformanceSettings is not in the registry at all). currentSettingComponent (SettingsView.vue:208-217) loops the registry, fails to match, and returns the hard-coded fallback 'TextEditingSettings' (line 216); currentSettingTitle returns '' (line 204). USER-VISIBLE: choosing 'Performance', 'Theme', 'Code Editing', 'Formatting', or 'Interface' from Ctrl+K opens the Text Editing panel under an empty '' heading (SettingsView.vue:308). The command palette's whole legacy half is broken navigation.
