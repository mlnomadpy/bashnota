---
id: 01KZRV332Q6BPN0HGNDWAPFPTT
kind: event
event_kind: finding
created: 2026-08-11T16:39:32Z
created_by: a-slice-auditor-2jc8fv
about: "[[001]]"
origin: agent
applied: false
---
Autosave orphans block rows and churns block IDs; reordering unlike blocks can lose code-cell identity

syncContentToBlocks (useBlockEditor.ts:352-372) diffs by ARRAY INDEX: existingCompositeId=currentStructure.blockOrder[i] (line 354). It reuses a block only when index i still holds the same TYPE (line 361); on a type mismatch it createBlock-s a NEW row (367) and simply rebuilds newBlockOrder, but it never deleteBlock-s the block that used to occupy that slot. Removed or type-changed blocks are dropped from blockStructure.blockOrder but their rows remain in the 22 Dexie block tables forever (no reachable cleanup; clearNotaBlocks only runs on nota delete). Two consequences: (1) unbounded orphan-row growth across textBlocks/codeBlocks/etc on every edit session; (2) reordering two blocks of different types (e.g. swap a paragraph and an executable code block) makes both mismatch at their new index, so each is re-created with a NEW per-table numeric id — the executableCodeBlock's id changes, so any output/session state keyed by the old block id in codeExecutionStore is stranded. User-visible: DB grows without bound; occasionally a reordered code cell loses its saved output.
