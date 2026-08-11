---
id: 01KZRVB3AAXGW99JEBMK1ZX46Z
kind: event
event_kind: finding
created: 2026-08-11T16:43:55Z
created_by: a-slice-auditor-cz4f43
about: "[[001]]"
origin: agent
applied: false
---
Markdown paste/import is lossy and coercive: static code fences become executable cells, inline math never parsed, displayMode dropped, pageLink unsupported, overlapping blocks silently degrade

src/features/editor/services/MarkdownParserService.ts (paste-time markdown to TipTap; there is NO TipTap-to-markdown serializer in this file or EnhancedMarkdownPasteHandler.ts). Defects: (1) :838-845 a plain fenced code block with a language is converted to node type executableCodeBlock, not a static codeBlock -- pasting example code yields a runnable cell. (2) convertTextWithInlineMath (:793-817) returns raw text -- inline dollar-delimited math is NOT parsed despite the name. (3) display math is parsed but displayMode is dropped (parser sets it :100, converter ignores :847-853). (4) pageLink has no parse pattern and no converter case (grep-absent) -- dropped to plain text. (5) removeOverlappingBlocks (:770-788) makes citation vs bibliography (shared @key syntax) and image vs multipleImages mutually exclusive; the loser silently degrades to plain text. (6) citation import keeps only the key with citationData empty (:958); pipeline nodes/edges always empty (:493-494); youtube title dropped (:976). USER-VISIBLE: pasted markdown loses formatting/semantics in these specific ways.
