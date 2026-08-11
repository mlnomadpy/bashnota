---
id: f-nota-store-bypasses-the-storage-adapter-on-10-write-paths-causing-split-brain
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-architecture-reviewer-yksca5
about: "[[t-01KZRSX01WV40GJGSSYCFMBS7Y]]"
origin: src/features/nota/stores/nota.ts:688
source_event: 01KZRT4S6JXVQ386F0W9ZAM0W8
---
# Nota store bypasses the storage adapter on 10+ write paths, causing split-brain when filesystem storage is active
src/features/nota/stores/nota.ts routes SOME writes through the adapter (createItem:231-237, saveItem:256-262, loadNotas:276-283, deleteItem:326-330) but hard-codes direct Dexie writes with NO adapter branch on many others: saveNotaVersion db.notas.update:688, deleteVersion db.notas.update:734, and db.notas.add/update at 829, 863, 982, 1305, 1367, plus a getSubPages read from db.notas.where at 750. getDb() (nota.ts:107-122) returns the adapter, so the branched paths honor USE_NEW_STORAGE while the unbranched ones ALWAYS hit IndexedDB. With filesystem mode on (main.ts:97), a nota created via createItem lands on disk, but adding a version or subpage writes to IndexedDB against an id that is not there -> silent data divergence / lost writes.
