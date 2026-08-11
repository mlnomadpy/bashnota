---
id: t-01KZRSXR3X7GZNARQBY6SZRRMC
kind: task
created: 2026-08-11T16:19:09Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 2, probable: 4, pessimistic: 8}"
---
# Review: storage layer correctness and data-loss risk
## Acceptance
- [x] Reviews FileSystemBackend, cachedStorageService, storageService and databaseAdapter for correctness under concurrent writes, partial writes, and interrupted saves
- [x] States explicitly whether migrationService can lose or corrupt user data, and under exactly what sequence of events
- [x] Assesses the Dexie schema in db.ts for missing indexes against the queries the app actually runs
- [x] Evaluates the LRU cache for staleness: can a user read a nota that was changed on disk by another editor
- [x] Assesses the fileWatcherService TODO at fileSystemBackend.ts:264 and states the user-visible consequence of it being unimplemented
- [x] Every finding is filed via 'dacli note add finding' with an --origin of file:line
## Log
- 2026-08-11T16:20:16Z claimed by a-data-reviewer-1hm2w7
- 2026-08-11T16:37:36Z accepted by a-root (applied 1 proposal(s))
- 2026-08-11T16:37:36Z closed WITHOUT verification — no --verify command was given
- 2026-08-11T16:37:36Z deliverable: no dacli/009-review-storage-layer-correctness-and-data-loss-risk branch — nothing to check against master
- 2026-08-11T16:37:36Z completed by a-root
- 2026-08-11T16:37:41Z finding by a-data-reviewer-1hm2w7: Switching storage mode runs NO migration — existing notas vanish from view after switch (event 01KZRT6N3CCCCR86ZCQ91KKZTD)
- 2026-08-11T16:37:41Z finding by a-data-reviewer-1hm2w7: MigrationService: count-only verify + target!=0 gate makes interrupted migration silently lossy (event 01KZRT6XVSC4TDMHQ8N84TFWA8)
- 2026-08-11T16:37:41Z finding by a-data-reviewer-1hm2w7: FileSystemBackend has no write serialization — overlapping saves of the same nota race (last-close-wins / throw) (event 01KZRT76KNA1P0E6NKMX9JN0AS)
- 2026-08-11T16:37:41Z finding by a-data-reviewer-1hm2w7: File watcher never started in the running app — 'real-time sync' is inert; external .nota edits never reflected (event 01KZRT7H5G7WMYVVHDJ4DXHER1)
- 2026-08-11T16:37:41Z finding by a-data-reviewer-1hm2w7: FileWatcherService onFileDeleted never fires — snapshot map reassigned before the delete-notify loop reads it (event 01KZRT7RV7CKX43NTAAYFJ30B4)
- 2026-08-11T16:37:41Z finding by a-data-reviewer-1hm2w7: CachedStorageService is dead code and mislabeled LRU; staleness question moot in prod but no invalidation exists (event 01KZRT82EBW5C990H0N3WC0QKB)
- 2026-08-11T16:37:41Z finding by a-data-reviewer-1hm2w7: Dexie 'tags' index is a plain (non-multiEntry) index on an array field — cannot serve per-tag queries (event 01KZRT8BYWA0XEE1HWX37K06KA)
- 2026-08-11T16:37:41Z finding by a-data-reviewer-1hm2w7: MigrationService preserveSource:false is misleading — it never deletes the source, only skips the backup (event 01KZRT8MDWXH94Y8PEMKBT3ZXP)
