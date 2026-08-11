---
id: f-5-confirmed-duplicated-logic-clusters-tiptap-text-extraction-copied-5x-node-to
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-code-quality-reviewer-1s4n3a
about: "[[t-01KZRSX02H6GV2QTB510YBAD3D]]"
origin: src/features/nota/stores/blockStore.ts:812
source_event: 01KZRTQDDYYCS59TQ5P1NHP5E0
---
# 5 confirmed duplicated-logic clusters; Tiptap text-extraction copied 5x, node-to-block mapping copied wholesale
Each verified by reading every copy.
1) Tiptap-node -> Block mapping (per-type switch, ~150 lines) copied near-line-for-line: src/features/nota/composables/useBlockEditor.ts:148-350 (syncContentToBlocks) and src/features/nota/stores/blockStore.ts:812-966 (importTiptapContent). Identical table header/rows extraction, list-items, heading level, math latex, subNotaLink special-case. A new block type or attr rename must be edited in both; divergence corrupts imported notes. Highest blast radius (persistence).
2) Recursive Tiptap-JSON text extraction — 5 copies, 4 byte-identical: src/features/ai/components/composables/useMentions.ts:7-27, src/App.vue:56-76, src/features/nota/views/SplitNotaView.vue:64-84, src/features/nota/views/PublicNotaView.vue:87-98, src/features/nota/composables/useBlockEditor.ts:92-107 (last two vary only in join separator). No shared helper exists.
3) Editor 'has real content' emptiness check — 4 copies in one file, ALREADY diverged: src/features/editor/components/NotaEditor.vue:534-540 and :576-582 (full check with node.some) vs :611 and :639 (shortened, drop the node check) — an empty-paragraph doc is now treated inconsistently across the 4 content-load watchers.
4) AIAssistantSidebar insert-to-editor + toast — 3 near-identical functions differing only in text source and one toast string: src/features/ai/components/components/AIAssistantSidebar.vue:397-428, :431-463, :466-496 (shared isInListItem list-item-wrap logic must be mirror-edited).
5) AI provider streaming fetch-wrapper duplicated within and across providers: src/features/ai/services/providers/geminiProvider.ts:79-113 and :438-472 (essentially identical), and ollamaProvider.ts:65-108 (same wrapper). processStream reader loop also structurally duplicated (geminiProvider.ts:350-391, ollamaProvider.ts:158-228).
NOTE: block->Tiptap mapping also parallels between blockStore.convertBlockToTiptap (545-784) and MarkdownParserService.convertToTiptap (822-1040) but input shapes differ (Block vs ParsedBlock), so weaker. ANSI-to-HTML is correctly centralized in src/lib/utils.ts (NOT duplicated).
