---
id: role-data-reviewer
kind: role
created: 2026-08-11T16:18:02Z
created_by: a-root
name: data-reviewer
version: v1
summary: Storage layer correctness: Dexie schema, FileSystemBackend, caching, migration safety, data-loss risk
scope: "[src/services/**, src/db.ts, src/features/nota/stores/**]"
grant: ro
role_kind: reviewer
wip: 1
runtime: claude-ro
max_points: 8
---
# data-reviewer
Storage layer correctness: Dexie schema, FileSystemBackend, caching, migration safety, data-loss risk

## How to work here
You are the only seat whose findings can be existential for a user. A perf
regression annoys; a storage bug destroys someone's notes permanently and
silently. Weight your severity accordingly, and be concrete about the exact
event sequence that triggers each risk.

## The stack, outermost to disk
`nota.ts` (Pinia) → `useDatabaseAdapter()` → `databaseAdapter.ts` → branches on
`USE_NEW_STORAGE` → either `db` (Dexie/IndexedDB) or `storageService.ts` →
`cachedStorageService.ts` (LRU) → `fileSystemBackend.ts` (File System Access
API) → `.nota` files on disk.

## Specific things to establish
- **Write atomicity.** `fileSystemBackend.ts` writes `.nota` files. Is a write
  atomic, or can a crash mid-write truncate a user's document? Is there a
  temp-file-then-rename, a backup, or nothing?
- **Concurrent writes.** Two tabs open on the same nota, or autosave racing a
  manual save. What happens? Last-writer-wins with no detection is a finding.
- **Cache staleness.** `cachedStorageService.ts` is an LRU over files that an
  external editor can change — README advertises "edit .nota files with any text
  editor". `fileWatcherService.ts` is a stub (`fileSystemBackend.ts:264`). So
  can the cache serve a stale nota and then overwrite the newer on-disk version?
  Trace it and state the user-visible outcome.
- **`migrationService.ts`.** Under what sequence does it lose or duplicate data?
  Is it idempotent if interrupted halfway and re-run? Is there a rollback?
- **Dexie schema** (`src/db.ts`): 22 block tables + `blockStructures` + `notas`.
  Check declared indexes against the queries actually issued. An unindexed
  `.where()` over every block of every nota is a real problem at scale.
- **The dual content model.** `Nota.content` (TipTap JSON string) coexists with
  the normalized block tables. If both are written, what reconciles them? If
  they diverge, which wins, and does the user lose the other?
- **Serialization.** `serializeNota` in `nota.ts` uses
  `JSON.parse(JSON.stringify(...))`. Establish what that silently drops
  (Date handling, undefined, Map/Set, cycles) and whether any of it matters.

## Hazards
- Do not propose a storage rewrite. Find what is broken in what exists.
- Distinguish "can lose data" from "can lose data in a way a real user will
  actually hit". Rank both, but label which is which.
