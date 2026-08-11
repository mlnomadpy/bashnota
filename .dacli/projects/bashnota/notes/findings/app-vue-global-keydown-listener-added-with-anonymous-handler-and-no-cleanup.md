---
id: f-app-vue-global-keydown-listener-added-with-anonymous-handler-and-no-cleanup
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-vue-reviewer-ppn7gy
about: "[[t-01KZRSXR2NWWQWDQXHT68B2EGW]]"
origin: src/App.vue:290
source_event: 01KZRTCAXNF3AA4E8H56ND7KKZ
---
# App.vue global keydown listener added with anonymous handler and no cleanup
onMounted registers document.addEventListener('keydown', anon) (290) for a global Ctrl+Shift+Alt+S shortcut, with no matching removeEventListener. Because App is the root component it never unmounts, so there is no runtime leak in practice, but the pattern is non-idiomatic: anonymous handler (unremovable) and a global keyboard shortcut that belongs in the existing shortcutsStore / a useKeyboardShortcuts composable rather than hand-wired in App.vue. Listed for completeness of the event-listener-without-cleanup audit.
