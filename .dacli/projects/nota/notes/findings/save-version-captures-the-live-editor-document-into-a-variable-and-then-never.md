---
id: f-save-version-captures-the-live-editor-document-into-a-variable-and-then-never
kind: note
note_kind: finding
created: 2026-08-11T16:44:12Z
created_by: a-root
severity: major
origin: src/features/editor/components/NotaEditor.vue:952
---
# Save Version captures the live editor document into a variable and then never uses it — versions snapshot the stale store object instead
Root independently verified the slice-auditor claim that version save/restore captures zero document content, and found the exact mechanism.

NotaEditor.vue:952 reads the live document:
    const content = editor.value.getJSON()

...and `content` is then NEVER REFERENCED AGAIN. Two lines later the snapshot is built from the store object instead:
    const versionNota = { ...currentNota.value } as any
    await notaStore.saveNotaVersion({ id, nota: versionNota, ... })

So the version stores whatever `currentNota.value.content` happens to hold. Because the editor persists through the block tables rather than through Nota.content, that field is stale or empty — and nota.ts:702 restoreVersion faithfully restores it via saveNota(). The user gets a success toast either way (line 964).

Consequence: "Save Version" and "Restore Version" are a data-loss trap. A user who saves a version, keeps editing, then restores, loses the newer work and does not get the older work back.

The `as any` cast on line 956 is what let the mistake through the compiler.

NOTE THE ROOT CAUSE BEHIND THE ROOT CAUSE: this is a plain unused-variable bug. `no-unused-vars` — on by default in every ESLint preset — would have caught it the day it was written. It survived because eslint.config.ts never registers a TS parser, so the project has never been linted. This finding is the concrete cost of that config bug, and the strongest argument for landing the tooling fix first.
