---
id: 01KZRT7B1MWPJBTDME4FS856BG
kind: event
event_kind: finding
created: 2026-08-11T16:24:23Z
created_by: a-architecture-reviewer-yksca5
about: "[[t-01KZRSX01WV40GJGSSYCFMBS7Y]]"
origin: src/services/settingsAdapter.ts:323
applied: true
---
Consolidated settings subsystem (~527 LOC) is orphaned: booted but never read; all real settings UI uses the legacy settingsStore

Two parallel settings systems exist. NEW: consolidatedSettingsService.ts (199 LOC) + settingsAdapter.ts (328 LOC) = ~527 LOC. useSettingsAdapter() (settingsAdapter.ts:323) is called by NOTHING outside its own file; main.ts:118-120 initializes it and app.provide(settingsAdapter) but no component ever inject(settingsAdapter) (grep for inject settingsAdapter = 0 hits). LEGACY: settingsStore.ts (323 LOC) is what every real consumer uses — useSettings.ts:2, SettingsPanel.vue:5, StorageModeSettings.vue:11, UnifiedAdvancedSettings.vue:25. USE_CONSOLIDATED_SETTINGS (useFeatureFlags.ts:14, default false) only toggles the boot init; flipping it changes nothing users can see because no UI reads the adapter. Net: ~527 LOC carried twice, dead in production.
