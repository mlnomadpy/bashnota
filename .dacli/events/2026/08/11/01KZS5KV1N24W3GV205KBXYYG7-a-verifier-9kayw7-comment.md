---
id: 01KZS5KV1N24W3GV205KBXYYG7
kind: event
event_kind: comment
created: 2026-08-11T19:43:27Z
created_by: a-verifier-9kayw7
about: "[[t-01KZRTMJ3Z4EVQHX8779GBNEP6]]"
origin: agent
applied: true
---
verify-verdict: confirmed — claude-ro (a-verifier-9kayw7) on claim: In NotaEditor.vue saveVersion(), the value returned by editor.getJSON() is assigned to a local named content and then never used; the version snapshot is built from currentNota.value instead, so saved versions do not contain the live editor document and restoring a version cannot return the user's work. — saveversion() drops editor.getjson() and snapshots stale currentnota; blocks never captured, restore never re-applies
