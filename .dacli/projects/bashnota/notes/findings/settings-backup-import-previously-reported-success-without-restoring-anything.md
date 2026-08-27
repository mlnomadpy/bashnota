---
id: f-settings-backup-import-previously-reported-success-without-restoring-anything
kind: note
note_kind: finding
created: 2026-08-19T14:47:21Z
created_by: a-codex-fixer-2w4cvm
about: "[[014]]"
severity: major
---
# Settings backup import previously reported success without restoring anything
src/features/settings/components/advanced/DataManagementSettings.vue:80 parsed JSON and the former lines 83-89 only checked data.notas while notaStore.importAllNotas was commented out; the UI then emitted an Import Successful toast. The implemented path now validates and transactionally restores the exact versioned archive before success.
