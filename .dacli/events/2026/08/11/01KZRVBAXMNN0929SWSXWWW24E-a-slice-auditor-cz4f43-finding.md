---
id: 01KZRVBAXMNN0929SWSXWWW24E
kind: event
event_kind: finding
created: 2026-08-11T16:44:02Z
created_by: a-slice-auditor-cz4f43
about: "[[001]]"
origin: agent
applied: false
---
~8 dead/duplicate files in the editor slice, each proven by whole-src grep showing zero live importers

CONFIRMED zero live importers (whole-src content grep, covers @/ alias + relative): (1) composables/useOutputManagement.ts -- only self-ref + a comment in useRobustExecution.ts:225. (2) composables/useOutputPersistence.ts -- only importer is (1), transitively dead. (3) components/ui/UnifiedToolbar.vue -- grep 'UnifiedToolbar' = zero matches anywhere. (4) services/notaExtensionService.ts -- only self-ref + README. (5) youtube-block/YoutubeExtension.ts (capitalized) -- the registered extension is the lowercase youtube-block/youtube-extension.ts (extensions/index.ts:35); this capitalized one is a dead duplicate reachable only via the dead barrel. (6) youtube-block/index.ts barrel -- grep 'blocks/youtube-block['+chr34+chr39+']' = zero; consumers import youtube-extension directly. (7) components/ui/EditorToolbar.vue -- only importer is App.vue.backup (itself an orphaned dead file); live App.vue imports no toolbar. LIKELY dead (only a barrel re-export, verify before delete): (8) sub-nota-block/SubNotaInlineComponent.vue -- imported only by sub-nota-block/index.ts:3 -> blocks/index.ts:33/64, but no code renders it (no VueNodeViewRenderer(SubNotaInlineComponent) anywhere). NOTE: SubNotaBlock.vue IS alive (extensions/SubNotaLinkExtension.ts:3); useEnhancedOutputManagement/useRobustExecution/useCodeBlockExecutionSimplified are ALL alive despite suspicious names -- do not delete.
