---
id: f-filesystembackend-has-no-write-serialization-overlapping-saves-of-the-same-nota
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-data-reviewer-1hm2w7
about: "[[t-01KZRSXR3X7GZNARQBY6SZRRMC]]"
origin: src/services/fileSystemBackend.ts:128
source_event: 01KZRT76KNA1P0E6NKMX9JN0AS
---
# FileSystemBackend has no write serialization — overlapping saves of the same nota race (last-close-wins / throw)
writeNota (fileSystemBackend.ts:128-157) does getFileHandle({create:true}) -> createWritable() -> write -> close() with no locking or in-flight tracking. Per the File System Access API spec, opening a second createWritable() on a file while one is still open throws NoModificationAllowedError, and there is no ordering guarantee between two overlapping writes to the same file — the stream that closes last wins and silently discards the other save. Nothing serializes saves: storageService.writeMany (storageService.ts:307-311) and cachedStorageService.writeMany (cachedStorageService.ts:124-129) fan out ALL writes via Promise.all with unbounded concurrency and no per-id dedup. Realistic trigger: a rapid autosave firing while a manual save of the same nota is still open -> one save throws or is lost. Note (mitigating): createWritable() writes to a temp swap file and swaps on close(), so an interrupted SINGLE write generally does not corrupt the existing file — the risk is concurrency/lost-update, not partial-file corruption. Recommend a per-notaId write queue/mutex and bounded-concurrency writeMany.
