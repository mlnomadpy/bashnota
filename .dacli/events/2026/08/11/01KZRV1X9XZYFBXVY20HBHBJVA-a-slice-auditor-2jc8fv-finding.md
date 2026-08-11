---
id: 01KZRV1X9XZYFBXVY20HBHBJVA
kind: event
event_kind: finding
created: 2026-08-11T16:38:54Z
created_by: a-slice-auditor-2jc8fv
about: "[[001]]"
origin: agent
applied: false
---
Version save/restore captures and restores ZERO document content

saveVersion (NotaEditor.vue:947-963) computes content=editor.getJSON() at line 952 but NEVER attaches it — it builds versionNota={...currentNota.value} (line 954-956) from the store Nota, which has no content field (content lives in blocks). The 'content' local is dead. saveNotaVersion (nota.ts:658-695) stores version.nota (metadata only). restoreVersion (nota.ts:702-722) does restoredNota=version.nota; saveNota(restoredNota) — it restores ONLY metadata (title/tags) and never touches the block tables. Blocks are never snapshotted at save time and never rewritten at restore time. User-visible: 'Save Version' + Version History 'Restore' (VersionHistoryDialog.vue:41-45) silently do nothing to the actual document; a user who edits, saves a version, edits more, then restores loses nothing/gains nothing — the feature is inert. Reachable from NotaEditor.vue:958 and App.vue:223.
