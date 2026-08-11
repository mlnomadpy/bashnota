---
id: 01KZRT97EQBEZVVB3F3Z69H2ZT
kind: event
event_kind: finding
created: 2026-08-11T16:25:25Z
created_by: a-test-reviewer-ce29ny
about: "[[t-01KZRSX034BWDE84AWXDZ2SCHX]]"
origin: src/features/nota/stores/nota.ts:658
applied: true
---
Minimum viable regression net: 6 test files to write first, each tied to the concrete bug it would catch

Prioritized starter set maximizing data-safety coverage per file. For each: the file to write, the module under test, and the specific regression it would have caught.

1. src/services/__tests__/notaContentRoundtrip.test.ts -> exercise storageService.writeNota + readNota (and fileSystemBackend) with a Nota that HAS a populated blockStructure and Date fields. Catches: serialization regressions that drop/corrupt blockStructure, and Date-becomes-string round-trip bugs. The current suite (fileSystemBackend.test.ts:271) only stores metadata, so this whole class is invisible today.

2. src/features/nota/stores/__tests__/nota.test.ts -> saveNota (nota.ts:337), saveNotaVersion (:658), restoreVersion (:715) with a Pinia test store + mocked adapter. Catches: a save that silently no-ops, a version restore that loads the wrong/empty content, updatedAt not bumping. Single highest-value file (1480 LOC, 0 tests, owns document persistence).

3. src/features/nota/stores/__tests__/blockStore.test.ts -> block CRUD + ordering + block-to-tiptap conversion. Catches: a reorder/delete that corrupts block structure, or a conversion that loses a block type — the user content silently changing.

4. src/features/editor/services/__tests__/MarkdownParserService.test.ts -> parse representative markdown (headings, code fences, tables, nested lists) to blocks and assert structure. Catches: an import/paste regression that drops fenced code or flattens nesting (1071 LOC).

5. src/features/editor/stores/__tests__/codeExecutionStore.test.ts -> run two cells, assert each output stored against the correct cell id and clears independently. Catches: output cross-contamination (cell A showing cell B result) and stale-output-after-rerun — correctness lies no crash reveals.

6. src/services/__tests__/migrationContent.test.ts -> extend migration coverage so the fake target backend is asserted to receive blockStructure, not just id/title/tags (migrationService.test.ts:121 checks only metadata today). Catches: a migration that silently strips document content while reporting report.success true.

Prerequisite: fix the TZ flakiness first so the suite is green and new tests are trusted. Write items 1-2 first — they cover the worst outcome (document loss) fastest.
