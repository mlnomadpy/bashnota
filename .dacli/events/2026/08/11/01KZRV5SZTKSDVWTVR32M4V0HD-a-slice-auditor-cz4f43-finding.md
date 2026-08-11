---
id: 01KZRV5SZTKSDVWTVR32M4V0HD
kind: event
event_kind: finding
created: 2026-08-11T16:41:01Z
created_by: a-slice-auditor-cz4f43
about: "[[001]]"
origin: agent
applied: false
---
Legacy Nota.content -> block conversion is stubbed; importing/cloning a published nota opens BLANK in the editor

The block editor hydrates only from the Dexie block tables (blockStore.getTiptapContent). It never converts an existing Nota.content TipTap-JSON string into blocks. nota.ts:1319-1320 (clone/import a published nota) logs 'Content conversion not yet implemented for block system' behind TODO 'Implement proper block creation instead of legacy conversion'; same TODO recurs at nota.ts:1379 and :1439. And useBlockEditor.initializeBlocks (src/features/nota/composables/useBlockEditor.ts:42-45) calls blockStore.initializeNotaBlocks, which creates an EMPTY blockOrder (blockStore.ts:421-437) rather than seeding from nota.content. USER-VISIBLE: cloning/importing any published nota (and, generally, opening any nota that has content in Nota.content but no rows in the block tables) shows an EMPTY document; the text is still in the DB row but the editor's content computed returns {type:'doc',content:[]} (NotaEditor.vue:250-253). This is the concrete failure mode of the two-content-model seam for the editor read path.
