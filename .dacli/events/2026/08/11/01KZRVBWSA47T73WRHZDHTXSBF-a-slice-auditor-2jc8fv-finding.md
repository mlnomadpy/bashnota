---
id: 01KZRVBWSA47T73WRHZDHTXSBF
kind: event
event_kind: finding
created: 2026-08-11T16:44:21Z
created_by: a-slice-auditor-2jc8fv
about: "[[001]]"
origin: agent
applied: false
---
Upgrade proposals cheap because importTiptapContent already exists and is the proven content-write path

The slice already has ONE working, tested TipTap->blocks writer: blockStore.importTiptapContent (blockStore.ts:789), used on the .nota import path (nota.ts:581/605/1006). Every content-content-loss defect I filed is fixable by reusing it, not by new machinery: (1) FIX CLONE (major): replace the 3 'Content conversion not yet implemented' TODO logs at nota.ts:1319/1379/1439 with await blockStore.importTiptapContent(newId, contentToConvert). contentToConvert is already computed one line above each TODO. ~3 line change makes Clone actually copy content. (2) FIX VERSIONS (major): in saveVersion (NotaEditor.vue:952) attach the already-captured editor.getJSON() onto the version payload (version.content), and in restoreVersion (nota.ts:702) call blockStore.importTiptapContent(notaId, version.content) then reload — reuses the same writer; no new serialization. (3) IMPLEMENT LEGACY MIGRATION (major): the documented-but-missing convertLegacyContent is one call — in loadNotaBlocks (blockStore.ts:343) when zero blocks exist but the row carries a legacy content string, JSON.parse it and importTiptapContent. Fulfils README's promise and un-blanks old notas. (4) REDUCE LOSS (major): heading/list/blockquote in useBlockEditor.ts (152/225/232) and ALL of importTiptapContent should store node.content ARRAY like paragraph already does (line 179) instead of node.content[0].text; convertBlockToTiptap already handles arrays for text (blockStore.ts:560-565), so extending that pattern preserves marks. (5) CONTENT SEARCH (partial): useNotaFilters.ts:118 TODO can be served by blockStore.getTiptapContent + existing text-extraction (useBlockEditor.ts:92 extractTextContent). All five lean on code the slice already ships.
