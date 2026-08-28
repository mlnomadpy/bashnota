---
id: f-filesystem-watcher-deletion-callbacks-cannot-fire-after-snapshot-replacement
kind: note
note_kind: finding
created: 2026-08-28T12:00:25Z
created_by: a-root
about: "[[023-feature-request-consolidate-duplicate-services-and-complete-storage-migration]]"
severity: major
---
# Filesystem watcher deletion callbacks cannot fire after snapshot replacement
fileWatcherService replaces the prior snapshot map before looking up deleted entries, so onFileDeleted cannot receive the removed nota even though external-edit watching is documented. Add deterministic add/change/delete callback coverage when completing the storage migration boundary.
