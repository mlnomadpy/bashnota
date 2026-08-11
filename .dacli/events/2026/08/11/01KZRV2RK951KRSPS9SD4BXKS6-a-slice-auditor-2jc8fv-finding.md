---
id: 01KZRV2RK951KRSPS9SD4BXKS6
kind: event
event_kind: finding
created: 2026-08-11T16:39:21Z
created_by: a-slice-auditor-2jc8fv
about: "[[001]]"
origin: agent
applied: false
---
Block round-trip is lossy: headings, lists, and imported paragraphs drop inline formatting and marks

The TipTap-to-block conversion flattens rich inline content to a single plain-text string on several node types. In syncContentToBlocks (useBlockEditor.ts): heading stores only node.content index0 text (line 152) so a heading with bold or multiple text runs keeps only the first run plain text; list items store item.content index0 content index0 text (lines 232-234) so nested lists, multi-paragraph items, and inline marks are discarded; blockquote line 225 same. Only paragraph preserves the full node.content array (line 179). The .nota IMPORT path blockStore.importTiptapContent is worse: paragraph stores node.content index0 text (line 834), dropping citations, marks, and any text after the first run for EVERY paragraph. On the way back convertBlockToTiptap (blockStore.ts lines 552-576) re-wraps these strings in a single text node, so formatting cannot be recovered. User-visible: bold, links, and citations inside headings and list items vanish after autosave; importing a .nota flattens all paragraph formatting.
