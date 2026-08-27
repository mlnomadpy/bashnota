---
id: f-verdict-refuted-metadata-only-legacy-files-can-become-indexeddb-authority
kind: note
note_kind: finding
created: 2026-08-26T13:08:58Z
created_by: a-verifier-744gsx
about: "[[015]]"
---
# verdict: refuted — metadata-only legacy files can become IndexedDB authority without document content
Counterexample at commit 474972d: src/services/fileSystemBackend.ts:168-176 explicitly accepts a legacy metadata-only .nota/.json and returns it; src/services/fileSystemBackend.ts:386-391 adds that legacy Nota to listNotas while only version-2 documents enter the hydration set, and :419 hydrates only those documents. switchToIndexedDB then takes that result at src/composables/useStorageMode.ts:173-178, clears and bulk-inserts db.notas, verifies only primary-key IDs at :179-183, and flips authority at :185. Thus a filesystem directory containing a valid legacy metadata-only nota switches successfully to IndexedDB with no block order or any of the 22 typed payloads migrated, contradicting migration-safe/content-verification. The focused implementation tests passed (21/21 for the four filesystem/migration suites), full Vitest reproduced 509 passed/1 skipped, and build/typecheck passed, but no test covers this accepted legacy migration path.
