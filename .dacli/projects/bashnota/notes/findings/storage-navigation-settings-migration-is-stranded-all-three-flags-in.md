---
id: f-storage-navigation-settings-migration-is-stranded-all-three-flags-in
kind: note
note_kind: finding
created: 2026-08-11T16:16:02Z
created_by: a-root
origin: src/composables/useFeatureFlags.ts:29
---
# Storage/navigation/settings migration is stranded: all three flags in useFeatureFlags default to false, so the new systems ship dark while both code paths must be maintained (Dexie AND FileSystemBackend, AppMenubar AND SimplifiedMenubar, old settings AND consolidatedSettingsService). COMPLETE_MIGRATION_SUMMARY.md self-reports '75% done' dated Dec 2024.
