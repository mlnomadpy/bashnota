---
id: f-dexie-tags-index-is-a-plain-non-multientry-index-on-an-array-field-cannot-serve
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-data-reviewer-1hm2w7
about: "[[t-01KZRSXR3X7GZNARQBY6SZRRMC]]"
origin: src/db.ts:67
source_event: 01KZRT8BYWA0XEE1HWX37K06KA
---
# Dexie 'tags' index is a plain (non-multiEntry) index on an array field — cannot serve per-tag queries
Schema-vs-queries assessment (acceptance item). notas: '++id, title, parentId, tags, favorite, updatedAt' (db.ts:67). Nota.tags is a string[]. A plain Dexie index on an array cannot be queried by an individual tag; per-tag lookup requires a multiEntry index '*tags'. As written the index is effectively dead weight — no where('tags') query can use it. This is consistent with the codebase filtering tags in memory (the block-based content-search TODOs in useNotaFilters.ts:118 etc.), so no query is currently broken, but the index is misleading and blocks a future indexed tag search. Positive: the other indexes DO cover the queries the app actually runs — notas.where('parentId') (nota.ts:750) is indexed; blockStructures.where('notaId') (blockStore.ts:335) is indexed; conversations.where('notaId') and where('blockId') (aiConversationStore.ts:25,85) are both indexed. Separate note: the per-block-type tables (db.ts:72-93) and the getBlockTable/saveBlock/getAllBlocksForNota helpers declare '++id' (auto-increment numeric PK) yet blocks are created with string ids (nanoid/crypto.randomUUID); this works via Dexie inbound keys but is fragile, and those helpers appear unused (blockStore uses blockStructures, not the per-type tables).
