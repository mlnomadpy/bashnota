---
id: 01KZRV7XAV2FVYYRKD870FA1TN
kind: event
event_kind: finding
created: 2026-08-11T16:42:10Z
created_by: a-slice-auditor-2jc8fv
about: "[[001]]"
origin: agent
applied: false
---
What blockStore.ts actually is: a write-through cache/serializer for the 22 tables, NOT the granular block editor it was designed as

BUILT TO BE (per README-BLOCK-INTEGRATION.md and its API surface): a granular block model where Tiptap edits map to individual block create/update/delete/reorder ops so only CHANGED blocks are written, enabling 'analytics', 'collaboration', per-block favorites, and legacy migration. Evidence of intent: createBlock/updateBlock/deleteBlock/reorderBlocks/getNextBlockOrder (blockStore.ts:143/197/250/286/75), composite-id scheme (10-19), per-type Dexie tables. WHAT IT DOES TODAY: it is driven almost entirely by ONE caller — syncContentToBlocks (useBlockEditor.ts:113) — which on every autosave re-serializes the ENTIRE document positionally (loop 137-372), calling updateBlock on every surviving index and createBlock for the rest. So 'only changed blocks are saved' is false; it is a full-document write-through on each save. The granular ops insertBlock/updateBlock/deleteBlock/reorderBlocks exported by useBlockEditor (571-588) have NO callers in the editor (Tiptap never calls them; it round-trips through getJSON->sync). deleteBlock is only reached on whole-nota delete via clearNotaBlocks. Net: the normalized 22-table schema buys nothing today — content is still a monolithic doc, just sharded across tables and re-written wholesale. User-facing dependence: yes, it is the sole content store (see load/save traces), so it cannot be deleted, but its granularity is unused.
