---
id: 01KZRV7PS76ZGZ8N8KXWQYXYY8
kind: event
event_kind: finding
created: 2026-08-11T16:42:03Z
created_by: a-slice-auditor-cz4f43
about: "[[001]]"
origin: agent
applied: false
---
README contradictions: the block-integration doc promises automatic migration, a convertLegacyContent API, and block-granular saves that the code does not implement

src/features/nota/README-BLOCK-INTEGRATION.md vs code (code wins): (1) :166-169 'Existing notas are automatically converted when first accessed... No data loss' -- FALSE: nota.ts:1319-1320 logs 'Content conversion not yet implemented'; useBlockEditor.initializeBlocks creates an EMPTY structure (blockStore.ts:421-437). (2) :172-177 documents 'const { convertLegacyContent } = useBlockEditor(notaId); await convertLegacyContent(...)' -- that function does NOT exist; useBlockEditor's returned API (useBlockEditor.ts:571-588) has no convertLegacyContent (grep repo-wide: only hits are the README). (3) :8-9/:103 'Only changed blocks are saved, not the entire document' -- FALSE: syncContentToBlocks re-walks the ENTIRE doc every sync (useBlockEditor.ts:136-372) and early-returns only when the whole doc is byte-identical (:119). (4) :183 'Old content continues to work / Backward Compatible' -- FALSE, see the blank-load finding. Also the block Markdown-Parser README (components/blocks/README.md:182,190) references MarkdownParserService.test.ts and MarkdownParserDemo.vue, neither of which exists in the repo. And editor/README.md:9 calls services 'managing custom Tiptap extensions' though the largest services are MarkdownParserService (1071 LOC parsing) and exportService.
