---
id: 01KZS5P63YXEKQK9QR1JC42PCW
kind: event
event_kind: finding
created: 2026-08-11T19:44:44Z
created_by: a-verifier-6ngcyj
about: "[[001]]"
origin: agent
applied: false
---
verdict: confirmed — saveVersion's editor.getJSON() is dead; snapshot is spread of currentNota, which lacks the block-stored live doc

Reread NotaEditor.vue:946-970 in the main checkout. Line 951 'const content = editor.value.getJSON()' is assigned and NEVER referenced again in the function. The snapshot is built at 953-955 as versionNota = {...currentNota.value} and passed to notaStore.saveNotaVersion at 957-962. (Sibling finding cited line 952 for getJSON; actual is 951 — off by one, mechanism identical.)

currentNota (NotaEditor.vue:232-234) = notaStore.getCurrentNota(props.notaId). Its .content is stale/empty because: (a) the live save path writes ONLY to blocks — processEditQueue->applyEditToDatabase->syncContentToBlocks (NotaEditor.vue:190); nothing writes editor.getJSON() back into currentNota.content; (b) deserializeNota (nota.ts:79-81) explicitly does NOT repopulate content from blocks ('Content is now stored in blocks, not in the content field'). Blocks live in separate Dexie tables, not embedded in the Nota row, so {...currentNota.value} cannot capture them.

Downstream confirms data loss: saveNotaVersion (nota.ts:668-671) stores version.nota verbatim — no re-read from blocks. restoreVersion (nota.ts:702-717) sets restoredNota = version.nota then saveNota(restoredNota); it does not rebuild blocks from the version. So a saved version contains no live editor document, and restore cannot return the user's work while the editor keeps rendering from blocks. Hunted for two counterexamples (an editor->currentNota.content watcher; block re-read in save/restore) — neither exists. CONFIRMED.
