---
id: f-version-history-snapshots-omit-normalized-document-blocks
kind: note
note_kind: finding
created: 2026-08-13T18:26:10Z
created_by: a-root
severity: major
scope: project
origin: src/features/editor/components/NotaEditor.vue:951
---
# Version history snapshots omit normalized document blocks
Read-only audit on current master found editor.getJSON() is captured then discarded before saveNotaVersion; Nota contains metadata only, and restoreVersion saves metadata without restoring block-table content. Repro design: save body A, edit to B, restore; metadata can revert while body remains B. Deferred behind the higher-risk unsupported-node blank-document/data-loss defect; use this evidence in the next review cycle.
