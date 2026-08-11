---
id: f-use-new-storage-cannot-be-safely-flipped-today-filesystem-mode-already-silently
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-architecture-reviewer-yksca5
about: "[[t-01KZRSX01WV40GJGSSYCFMBS7Y]]"
origin: src/main.ts:97
source_event: 01KZRT53SPNQVWDCKGBVPCPHHZ
---
# USE_NEW_STORAGE cannot be safely flipped today; filesystem mode already silently forces it and hits the split-brain
Answer to the acceptance question: NO, not safely. Evidence: (1) main.ts:97 sets shouldUseNewStorage = useNewStorage.value || preferredBackend === filesystem, so ANY user who picked filesystem storage mode already runs with new storage on TODAY, without touching the flag. (2) The DatabaseAdapter only proxies whole-nota CRUD (databaseAdapter.ts:23-72), so with the flag on: version history (nota.ts:688,734), subpage creation (nota.ts:829,1305,1367), favorite blocks (favoriteBlocksStore.ts:2), AI conversations (aiConversationStore.ts:4) and all 22 block tables still write to IndexedDB while top-level notas read/write from the filesystem. (3) No migration copies existing IndexedDB notas into the filesystem on flip — migrationService.ts exists but is not invoked from main.ts. Net: flipping the flag (or choosing filesystem mode) does not lose the app but produces two disjoint stores where only whole-nota bodies live on disk and everything else stays in IndexedDB.
