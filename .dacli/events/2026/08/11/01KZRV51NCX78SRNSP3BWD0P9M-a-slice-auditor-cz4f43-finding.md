---
id: 01KZRV51NCX78SRNSP3BWD0P9M
kind: event
event_kind: finding
created: 2026-08-11T16:40:36Z
created_by: a-slice-auditor-cz4f43
about: "[[001]]"
origin: agent
applied: false
---
Editor persists ONLY to block tables via lossy sync; headings/lists/quotes/table-cells keep only the first text node

The editor's sole edit-persistence path is NotaEditor.vue onUpdate -> smartSave -> debouncedSave -> processEditQueue -> applyEditToDatabase (NotaEditor.vue:191) -> syncContentToBlocks (nota slice: src/features/nota/composables/useBlockEditor.ts). Nota.content (the serialized TipTap JSON string) is NOT written on normal edits; the editor both reads (getTiptapContent, NotaEditor.vue:242) and writes exclusively through the 22 Dexie block tables. That block conversion is LOSSY: useBlockEditor.ts:152 heading -> node.content?.[0]?.text (only FIRST inline text node); :188 codeBlock same; :206-213 table headers/rows use cell.content?.[0]?.text (first text node per cell); :225 blockquote node.content?.[0]?.content?.[0]?.text; :233 list items item.content?.[0]?.content?.[0]?.text. USER-VISIBLE: type a heading like 'Intro to <code>x</code>' or a list item with bold/inline-code/a citation, reload the nota -> everything after the first text run is silently dropped. Table cells with multiple paragraphs or formatting collapse to their first text node. Round-trip completes via blockStore.getTiptapContent (src/features/nota/stores/blockStore.ts:472) which rebuilds only from these truncated fields.
