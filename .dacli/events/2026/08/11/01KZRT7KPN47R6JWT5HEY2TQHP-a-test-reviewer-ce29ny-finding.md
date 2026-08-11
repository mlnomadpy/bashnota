---
id: 01KZRT7KPN47R6JWT5HEY2TQHP
kind: event
event_kind: finding
created: 2026-08-11T16:24:32Z
created_by: a-test-reviewer-ce29ny
about: "[[t-01KZRSX034BWDE84AWXDZ2SCHX]]"
origin: src/services/fileSystemBackend.test.ts:271
applied: true
---
Service-layer tests are behaviour-oriented (good), but share a systemic blind spot: document CONTENT is never round-tripped

Assessed the 3 largest service tests. They test BEHAVIOUR through the public API, not implementation restatement — this is good design:
- storageService.test.ts:40-132 writes a nota then reads/updates/deletes and asserts observable results; :140-181 exercises real error + backend-fallback paths.
- migrationService.test.ts:65-139 uses in-memory fake backends and asserts data integrity, error handling (:106), batching (:151), rollback (:181), progress phases (:195). Solid.
- fileSystemBackend.test.ts:270-406 mocks the File System Access API and round-trips the .nota wrapper, dates (:388), list/delete/parse-error paths.

SYSTEMIC BLIND SPOT (data-loss risk): every test constructs a Nota with ONLY metadata (id/title/tags/favorite/dates) and NEVER a blockStructure/content payload. Nota's real document content lives in blockStructure (src/features/nota/types/nota.ts:8-10) and is managed by blockStore.ts. fileSystemBackend.writeNota (src/services/fileSystemBackend.ts:141-148) stores 'nota: nota' wholesale, and readNota JSON.parses it back (:97) — but with dates as strings and blockStructure never present, no test verifies the content survives a save/load cycle, nor that Date round-trips as Date vs string. A serialization regression that drops/corrupts blockStructure, or a Date-as-string bug, passes 100% of the storage suite. The most valuable user asset (their document text) has ZERO persistence-round-trip coverage.
