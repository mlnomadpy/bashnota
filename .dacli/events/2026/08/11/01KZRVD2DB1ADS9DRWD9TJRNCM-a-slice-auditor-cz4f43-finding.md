---
id: 01KZRVD2DB1ADS9DRWD9TJRNCM
kind: event
event_kind: finding
created: 2026-08-11T16:44:59Z
created_by: a-slice-auditor-cz4f43
about: "[[001]]"
origin: agent
applied: false
---
UPGRADE: make block persistence lossless by replicating the paragraph pattern already in useBlockEditor for heading/quote/list/table-cell

The write path useBlockEditor.ts:179 ALREADY stores the full node.content inline array for paragraphs ('preserve inline nodes'), and the read path blockStore.convertBlockToTiptap ALREADY re-emits array content intact for text blocks (blockStore.ts:560-565). The fix for the heading/quote/list/table-cell data-loss finding is to apply the SAME two patterns to those cases (currently :152/:225/:232/:206 flatten to first-text-node) instead of building new serialization. Cheap because both halves of the round-trip already exist and are proven for paragraphs; this is replication, not new machinery.
