---
id: 01KZRTH2Q8JNDG7DBSGEZ42E4G
kind: event
event_kind: finding
created: 2026-08-11T16:29:42Z
created_by: a-vue-reviewer-ppn7gy
about: "[[t-01KZRSXR2NWWQWDQXHT68B2EGW]]"
origin: src/features/editor/components/dialogs/ExportDialog.vue:147
applied: true
---
Watch used where a computed belongs in ExportDialog

The watch handler at line 147 only mirrors notaTitle.value = newNota?.title || 'Untitled'. notaTitle is display-only (rendered in template, never independently reassigned), so it is a pure derivation of the source nota and should be a computed. Fix: replace ref+watch with computed(() => currentNota?.title || 'Untitled').
