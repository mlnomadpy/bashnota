---
id: 01KZS5KM0T6T4PRGSYGHH9JJ33
kind: event
event_kind: finding
created: 2026-08-11T19:43:20Z
created_by: a-verifier-9kayw7
about: "[[001]]"
origin: agent
applied: false
---
verdict: confirmed — saveVersion() drops editor.getJSON() and snapshots stale currentNota; blocks never captured, restore never re-applies

Re-derived from scratch; refutation attempt (that currentNota.content might be synced to the live editor) failed.

CHAIN:
1. NotaEditor.vue:951 'const content = editor.value.getJSON()' — assigned then NEVER referenced again. Lines 953-955 build 'const versionNota = { ...currentNota.value } as any'; line 957-962 passes versionNota (not content) to notaStore.saveNotaVersion. Confirmed unused-variable bug (the 'as any' at 955 hides it from the compiler).

2. currentNota is the STORE object: NotaEditor.vue:232-234 currentNota = notaStore.getCurrentNota(props.notaId). Its .content field is stale/empty because the live document is persisted to the 22 block tables, not to Nota.content: applyEditToDatabase (NotaEditor.vue:187-190) and smartSave (223) call syncContentToBlocks; useBlockEditor.ts writes only into block tables (blockData.content assignments at 152/179/188/225/288/309/327/349). No code path writes editor.getJSON() back into the store nota.content during editing.

3. Store never captures blocks into the version: nota.ts saveNotaVersion 668-688 builds NotaVersion { nota: version.nota } and db.notas.update — it serializes version.nota verbatim and never reads getTiptapContent or the block tables.

4. Restore cannot return the work: nota.ts restoreVersion 702-715 restores version.nota via saveNota(restoredNota) and never touches the block tables, which are what NotaEditor renders from (getTiptapContent). So even the .content it does carry would not re-render.

CONSEQUENCE (user-visible): Save Version + Restore Version is a data-loss trap — a user who saves a version, keeps editing, then restores loses newer block-persisted work and does not recover the older document. deserializeNota comment nota.ts:81 ('Content is now stored in blocks') corroborates the model. Claim CONFIRMED.
