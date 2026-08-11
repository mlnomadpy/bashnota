---
id: 01KZRV8QDZBNA8C1A7HH6QJSWZ
kind: event
event_kind: finding
created: 2026-08-11T16:42:37Z
created_by: a-slice-auditor-m6eb9n
about: "[[001]]"
origin: agent
applied: false
---
Slice-local upgrades that are cheap because of the single-resolver + single-composable design

1) DELETE the ~10 orphaned/dead panels in one pass: they are already referenced from exactly one place each (SettingsPanel.vue componentMap + the commented registry lines), so removal needs no import-graph surgery -- drop the map entries at SettingsPanel.vue:26-28,34-35,45-46,61, the two dead files (AIActionsSettings/AICodeActionsSettings.vue), base/SettingItem.vue, and the commented registry blocks. ~2500 LOC, near-zero risk. 2) FIX toasts mechanically: the misuse is uniform (toast({title,description,variant})), so a single codemod to toast.success(title,{description}) / toast.error(title,{description}) fixes every active panel; grep 'toast({' scopes it. 3) SINGLE-SOURCE the command palette: SettingsCommandPalette.vue keeps a hand-maintained parallel list that has already drifted from SettingsView.vue settingsCategories -- derive palette items from that registry to kill the wrong-panel navigation defect permanently. 4) WIRE the migration at the composable seam, not via injection: every write already funnels through useSettings.ts -> settingsStore; gate settingsStore's load/save internals on USE_CONSOLIDATED_SETTINGS instead of the never-injected adapter, so the flag finally means something without touching 15 panels.
