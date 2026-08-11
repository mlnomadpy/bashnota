---
id: f-deep-watchers-deep-true-on-large-output-content-structures-across-editor
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-perf-reviewer-mag58h
about: "[[t-01KZRSX0151GFYPXJNE9M9B86Z]]"
source_event: 01KZRTHFWHAE72J2NJABHK069Z
---
# Deep watchers (deep:true) on large output/content structures across editor composables cause O(size) diffing per change
Multiple deep watchers traverse large reactive structures on every mutation: useEnhancedOutputManagement.ts:287-305 watches ()=>cellOutput.value with {deep:true, immediate:true} — cell output content can be large strings/objects and deep-watching walks the whole structure each change; useOutputManagement.ts:330 {immediate:true, deep:true}; useOutputPersistence.ts:237 {deep:true}; PipelineNode.vue:1795 {deep:true} (2116-line node component); usePipelineFlow.ts:825 {deep:true}; TableBlock.vue:118 {deep:true}; theorem-block/TheoremBlock.vue:511 and subfigure SubfigureCaption.vue:123 both {deep:true, immediate:true}. Each deep watcher forces Vue to recursively track and compare the entire target on every dependency tick; on large code outputs or big tables this is O(structure size) per change and compounds when many blocks are mounted. Fix: watch specific primitive fields (e.g. ()=>cellOutput.value?.content) instead of deep-watching whole objects, or shallowRef the payload. Risk: low-moderate (must pick the right fields).
