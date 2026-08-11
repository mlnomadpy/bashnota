---
id: 01KZRVA9MXJNWMM5JB2VM3EPPQ
kind: event
event_kind: finding
created: 2026-08-11T16:43:28Z
created_by: a-slice-auditor-cz4f43
about: "[[001]]"
origin: agent
applied: false
---
Version history is body-content-lossy: saveVersion computes editor.getJSON() but discards it; restoring a version cannot restore body text

NotaEditor.vue:952-956 saveVersion computes a local content=editor.getJSON() but never uses it; the version snapshot is {...currentNota.value}, and the Nota type has NO content field (src/features/nota/types/nota.ts:4-21; comment nota.ts:81 'Content is now stored in blocks, not in the content field'). saveNotaVersion (nota.ts:658-695) stores only metadata incl. blockStructure.blockOrder ids, not the block records themselves. restoreVersion -> saveNota (nota.ts:702-722) therefore restores only title/metadata. USER-VISIBLE: 'Restore version' appears to work but the document body does not revert (and the discarded getJSON at :952 is dead code). This is a direct consequence of the completed Nota.content->blocks migration: versioning was never updated to snapshot block rows.
