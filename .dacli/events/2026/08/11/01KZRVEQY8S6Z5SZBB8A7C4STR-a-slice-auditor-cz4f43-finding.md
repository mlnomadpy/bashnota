---
id: 01KZRVEQY8S6Z5SZBB8A7C4STR
kind: event
event_kind: finding
created: 2026-08-11T16:45:54Z
created_by: a-slice-auditor-cz4f43
about: "[[001]]"
origin: agent
applied: false
---
Reconstructed intent + corrected architectural fact: the Nota.content TipTap-JSON string no longer exists for local editing; the 22 block tables are the SOLE authoritative store

INTENT: src/features/editor is a TipTap-based rich-text shell for a code-executing notebook. TipTap remains the live editing surface, but body content was migrated OUT of a single serialized Nota.content JSON string INTO 22 normalized Dexie block tables (one per block type) indexed by a blockStructure.blockOrder. The slice ships 12 custom TipTap nodes plus 2 non-node UIs, a markdown paste/import parser, an HTML export pipeline, and the code-execution store. CORRECTION TO THE BRIEFS CENTRAL FACT: the two content models do NOT coexist for local notas. The Nota type has NO content field (src/features/nota/types/nota.ts lines 4-21; comment at nota.ts:81 says Content is now stored in blocks not in the content field). serializeNota/deserializeNota never read or write a content string. A TipTap-JSON content string now exists ONLY transiently on PublishedNota (server payload) and import/export. So the block tables are AUTHORITATIVE and the JSON-string model is effectively retired for editing. The seam is the editor-to-nota boundary: the editor reads and writes body content entirely through nota-slice code (useBlockEditor + blockStore), its single largest coupling. The unfinished part of the migration is exactly the conversion in and out of that string form (clone/import stubs, version history, lossy sync) -- see the related defect findings.
