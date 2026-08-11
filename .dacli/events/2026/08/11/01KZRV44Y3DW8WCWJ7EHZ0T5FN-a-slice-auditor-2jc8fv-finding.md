---
id: 01KZRV44Y3DW8WCWJ7EHZ0T5FN
kind: event
event_kind: finding
created: 2026-08-11T16:40:07Z
created_by: a-slice-auditor-2jc8fv
about: "[[001]]"
origin: agent
applied: false
---
README-BLOCK-INTEGRATION documents a legacy-content migration that does not exist; pre-block notas render blank

README-BLOCK-INTEGRATION.md:166-177 claims 'Existing notas are automatically converted when first accessed', 'Legacy content is preserved', 'No data loss during migration', and documents a manual helper: const {convertLegacyContent}=useBlockEditor(notaId); await convertLegacyContent(...). CODE CONTRADICTS: convertLegacyContent appears in NO source file (grep hit: only the README). useBlockEditor's return object (useBlockEditor.ts:571-588) does not expose it, and loadNotaBlocks (blockStore.ts:321-415) has no branch that reads a row's legacy TipTap string and converts it — when no blocks exist it just builds an empty structure. The current Nota type (types/nota.ts:4-21) no longer even declares a content field, and deserializeNota (nota.ts:79-101) drops any content on the row. Net: any nota whose content predates the block tables (content only on the notas row) loads as an empty document with no migration path. Also false: README:184 'Only changed blocks are saved' — syncContentToBlocks rewrites every block every save (useBlockEditor.ts:361-369). Code wins; the README is aspirational.
