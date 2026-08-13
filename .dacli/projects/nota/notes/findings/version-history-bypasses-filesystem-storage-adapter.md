---
id: f-version-history-bypasses-filesystem-storage-adapter
kind: note
note_kind: finding
created: 2026-08-13T19:36:19Z
created_by: a-root
severity: major
scope: project
origin: src/features/nota/stores/nota.ts:696
---
# Version history bypasses filesystem storage adapter
Filesystem mode routes normal nota CRUD through the new adapter, but save/restore/delete version directly require Dexie db.notas. Filesystem-created notas therefore cannot use version history. Deferred behind the canonical numeric-key deletion/resurrection defect. Next task should either implement durable adapter-backed versions or disable actions before mutation with actionable UI and filesystem integration tests.
