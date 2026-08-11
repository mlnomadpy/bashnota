---
id: d-authoritative-runtime-content-model-is-the-22-dexie-block-tables-not-nota
kind: note
note_kind: decision
created: 2026-08-11T16:38:46Z
created_by: a-slice-auditor-2jc8fv
about: "[[001]]"
---
# Authoritative runtime content model is the 22 Dexie block tables, NOT Nota.content
## Chose
Authoritative runtime content model is the 22 Dexie block tables, NOT Nota.content
## Rejected
Nota.content TipTap JSON string is authoritative
## Because
The live editor reads content ONLY from blocks and writes content ONLY to blocks. NotaEditor.vue:237-254 'content' computed returns getTiptapContent.value (useBlockEditor.ts:400-407 -> blockStore.getTiptapContent, blockStore.ts:472) with an empty-doc fallback and NO Nota.content fallback. On save NotaEditor.vue:191 calls syncContentToBlocks (useBlockEditor.ts:113) which createBlock/updateBlock into the block tables. nota.ts deserializeNota:79-81 explicitly drops the content field ('Content is now stored in blocks'). createItem:213 never sets content. Therefore Nota.content is vestigial for app-created notas; blocks decide what renders. Consequence: any code path that still writes Nota.content (import inline, publish payload) is a side-channel, not the source of truth.
