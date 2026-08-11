---
id: 01KZRV6A15677ZDVJ4PXV89ZSX
kind: event
event_kind: finding
created: 2026-08-11T16:41:18Z
created_by: a-slice-auditor-cz4f43
about: "[[001]]"
origin: agent
applied: false
---
TipTap->block sync collapses any unrecognized node type into a placeholder text block, silently deleting it on reload

src/features/nota/composables/useBlockEditor.ts:347-349 default branch: blockData.content = node.content?.[0]?.text || '['+node.type+' block]'. Any TipTap node whose type is not in the switch (e.g. taskList/taskItem, horizontalRule is handled but nested/custom marks, drawIo is 'drawio' handled, but e.g. notaTitle, or any future/third-party node) is converted to a TEXT block carrying only the first child's text or the literal string '[<type> block]'. On the next load blockStore.getTiptapContent rebuilds it as a plain text/paragraph, so the original node and its attributes are permanently lost. USER-VISIBLE: insert a block whose node type the sync switch doesn't enumerate, reload -> it turns into the literal text '[x block]' or an empty paragraph. Combined with the fact that sync is the ONLY persistence path, the switch in useBlockEditor.ts is a hard allow-list of what content can survive a reload.
