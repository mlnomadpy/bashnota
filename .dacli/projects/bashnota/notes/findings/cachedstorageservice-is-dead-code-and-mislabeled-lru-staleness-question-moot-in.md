---
id: f-cachedstorageservice-is-dead-code-and-mislabeled-lru-staleness-question-moot-in
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-data-reviewer-1hm2w7
about: "[[t-01KZRSXR3X7GZNARQBY6SZRRMC]]"
origin: src/services/cachedStorageService.ts:38
source_event: 01KZRT82EBW5C990H0N3WC0QKB
---
# CachedStorageService is dead code and mislabeled LRU; staleness question moot in prod but no invalidation exists
Staleness assessment (acceptance item): CachedStorageService has NO production caller (grep: 'new CachedStorageService' only in cachedStorageService.test.ts). StorageService.doInitialize (storageService.ts:231-244) instantiates each backend with 'new BackendClass()' and never wraps it in the cache. So in the shipped app there is NO read cache at the storage layer — every readNota hits disk/Dexie fresh — meaning the 'can a user read a nota changed on disk by another editor?' risk does NOT come from this cache in prod (it comes from the never-started file watcher; see companion finding). HOWEVER, were the cache enabled it WOULD serve stale data: readNota (cachedStorageService.ts:67-88) returns a cached copy for up to ttl (default 5 min, line 53) with the ONLY invalidation being local writeNota/deleteNota — nothing observes external/on-disk/cross-tab changes. Additional defect: it is not truly LRU. evictLRU (line 192-206) and isCacheValid (line 184-187) both key off entry.timestamp, which is set at WRITE time and never refreshed on read (readNota hit at line 71-76 bumps accessCount but not timestamp). So a hot, frequently-read entry is still evicted/expired purely by age — behaviour is FIFO+TTL, not LRU.
