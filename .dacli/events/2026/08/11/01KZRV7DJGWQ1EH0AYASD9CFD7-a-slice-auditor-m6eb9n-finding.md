---
id: 01KZRV7DJGWQ1EH0AYASD9CFD7
kind: event
event_kind: finding
created: 2026-08-11T16:41:54Z
created_by: a-slice-auditor-m6eb9n
about: "[[001]]"
origin: agent
applied: false
---
Three coexisting component generations explain the 47-file count; ~10 files are orphaned/dead duplicates

The slice ships 47 .vue (13049 LOC). AI settings alone is ~19 .vue (7 top-level + 11 ai/components/* + WebLLMDefaultModelManager), ~40pct of files. The high ratio is driven by THREE unfinished generations left in place: original per-topic -> 'Improved*' -> 'Unified*'. ORPHANED (mapped in SettingsPanel.vue but commented out of the SettingsView registry, so unreachable via UI): editor TextEditingSettings/CodeEditingSettings/FormattingSettings (SettingsView.vue:62-64), appearance ThemeSettings/InterfaceSettings (73-75), ai AIProvidersSettings/AIGenerationSettings (87-88). ORPHANED (in componentMap but not in registry at all): advanced/PerformanceSettings (SettingsPanel.vue:61). DEAD (zero importers): AIActionsSettings.vue+AICodeActionsSettings.vue (see separate finding) and base/SettingItem.vue (grep: no importers; the other 6 base primitives are used by 6 files). The Unified* components do NOT wrap the legacy ones -- they reimplement on base/ primitives (UnifiedEditorSettings.vue:11-15) -- so the legacy files are pure duplication, ~2500+ LOC removable. VERDICT: 47 is NOT justified; ~10 superseded files should be deleted.
