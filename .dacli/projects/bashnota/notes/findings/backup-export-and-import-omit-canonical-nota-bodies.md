---
id: f-backup-export-and-import-omit-canonical-nota-bodies
kind: note
note_kind: finding
created: 2026-08-19T14:38:34Z
created_by: a-root
about: "[[012]]"
severity: major
---
# Backup export and import omit canonical nota bodies
src/features/nota/stores/nota.ts:705-719 exports metadata-only Nota objects; Nota has no content field. src/features/settings/components/advanced/DataManagementSettings.vue:80-95 expects an incompatible object, performs no persistence, and reports success. Fresh restore cannot recover document bodies.
