---
id: 01KZRVD6SYF49SVJ41J43FKV1R
kind: event
event_kind: finding
created: 2026-08-11T16:45:04Z
created_by: a-slice-auditor-cz4f43
about: "[[001]]"
origin: agent
applied: false
---
UPGRADE: fix blank-load, clone-import, and version-restore by reusing the already-wired blockStore.importTiptapContent

blockStore.importTiptapContent (blockStore.ts:789-984) is a complete, battle-tested TipTap-JSON -> block-tables converter already used by .nota import (nota.ts:581/605/1006). The three stubbed clone TODOs (nota.ts:1319/1379/1439, which merely log 'not implemented') and useBlockEditor.initializeBlocks's blank hydrate (useBlockEditor.ts:42-45 -> empty initializeNotaBlocks) can each be fixed by calling importTiptapContent(parsedContent) instead. Version history (NotaEditor.vue:952 already computes editor.getJSON() but discards it) can persist that JSON into the version row and restore via the same importTiptapContent path. Cheap because the converter and its call sites already exist; it is wiring, not new code.
