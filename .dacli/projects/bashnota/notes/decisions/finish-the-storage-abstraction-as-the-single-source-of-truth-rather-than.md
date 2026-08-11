---
id: d-finish-the-storage-abstraction-as-the-single-source-of-truth-rather-than
kind: note
note_kind: decision
created: 2026-08-11T16:26:23Z
created_by: a-architecture-reviewer-yksca5
about: "[[003]]"
---
# Finish the storage abstraction as the single source of truth rather than ripping it out
## Chose
Finish the storage abstraction as the single source of truth rather than ripping it out
## Rejected
Delete all new-storage/filesystem code and revert to Dexie-only single storage
## Because
Filesystem/local-first is a stated product identity and filesystem mode ALREADY ships to users today (main.ts:97 forces new storage when mode=filesystem), so deletion removes a live, differentiating capability — and you would still have to touch every bypass site to unwind the adapter cleanly. The split-brain (findings above) is a correctness hazard shipping NOW, so the end-state must make ONE store authoritative. Recommended ordered sequence: (1) Stop the bleeding — until the abstraction is complete, do not silently force new storage from mode=filesystem at main.ts:97; keep it behind an explicit experimental guard. (2) Route ALL nota writes in nota.ts through getDb()/adapter, eliminating the direct db.notas.* sites at 688,734,829,863,982,1305,1367. (3) Make useFilesystemNotas.ts:58 use the singleton StorageService/adapter instead of `new FileSystemBackend()`. (4) Extend IStorageBackend to cover favorites/conversations/blockStructures, OR explicitly scope them to IndexedDB and document it. (5) Wire the already-built MigrationService + MigrationDialog into StorageModeSettings so switching modes copies data (with its existing verify/rollback) — this is the fix for the never-invoked migration engine. (6) Resolve settings & navigation separately: delete the orphaned consolidatedSettings stack (~527 LOC) and pick ONE nav, deleting the other (~900 LOC), unless product commits to the redesign. (7) Delete CachedStorageService or insert it into StorageService. (8) Remove the three feature flags once each subsystem is single-path.
