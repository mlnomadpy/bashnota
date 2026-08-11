---
id: 01KZRT8GAZSRE7CDGBDA5M53AW
kind: event
event_kind: finding
created: 2026-08-11T16:25:01Z
created_by: a-architecture-reviewer-yksca5
about: "[[t-01KZRSX01WV40GJGSSYCFMBS7Y]]"
origin: src/services/cachedStorageService.ts:38
applied: true
---
CachedStorageService (~156 LOC) is orphaned: implements IStorageBackend but no code ever wraps a backend with it

src/services/cachedStorageService.ts:38 defines CachedStorageService (an LRU caching IStorageBackend decorator, ~156 LOC). grep for CachedStorageService across src returns only the class definition and src/services/__tests__/cachedStorageService.test.ts. StorageService.doInitialize (storageService.ts:183-260) instantiates FileSystemBackend/IndexedDBBackend/MemoryBackend directly and never wraps them in the cache. So the caching layer is fully dead code — built and unit-tested but never inserted into the storage pipeline.
