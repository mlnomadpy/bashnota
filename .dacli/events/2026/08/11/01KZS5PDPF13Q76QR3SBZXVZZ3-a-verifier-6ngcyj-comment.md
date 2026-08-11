---
id: 01KZS5PDPF13Q76QR3SBZXVZZ3
kind: event
event_kind: comment
created: 2026-08-11T19:44:51Z
created_by: a-verifier-6ngcyj
about: "[[t-01KZRTMJ3Z4EVQHX8779GBNEP6]]"
origin: agent
applied: true
---
verify-verdict: confirmed — claude-ro2 (a-verifier-6ngcyj) on claim: In NotaEditor.vue saveVersion(), the value returned by editor.getJSON() is assigned to a local named content and then never used; the version snapshot is built from currentNota.value instead, so saved versions do not contain the live editor document and restoring a version cannot return the user's work. — saveversion's editor.getjson() is dead; snapshot is spread of currentnota, which lacks the block-stored live doc
