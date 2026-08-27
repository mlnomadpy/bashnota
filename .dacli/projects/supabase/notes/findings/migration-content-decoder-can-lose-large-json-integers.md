---
id: f-migration-content-decoder-can-lose-large-json-integers
kind: note
note_kind: finding
created: 2026-08-18T13:11:03Z
created_by: a-root
about: "[[t-01KZYG5K04Z71RHFPEWKWGNRPH]]"
severity: major
---
# Migration content decoder can lose large JSON integers
JSON.parse accepts 9007199254740993 and rounds to 9007199254740992 without quarantine. Implement lossless typed decode or quarantine non-lossless content round trips with nested-number tests.
