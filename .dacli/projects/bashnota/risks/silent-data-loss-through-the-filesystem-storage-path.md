---
id: r-silent-data-loss-through-the-filesystem-storage-path
kind: risk
created: 2026-08-11T16:30:03Z
created_by: a-root
impact: high
likelihood: medium
---
# Silent data loss through the filesystem storage path
## Indicators
- fileWatcherService is a stub (fileSystemBackend.ts:264) while the README advertises editing .nota files in any external editor
- cachedStorageService is an LRU with no invalidation signal from disk
## Action
Do not flip USE_NEW_STORAGE to default-true until round-trip and concurrent-write tests exist
