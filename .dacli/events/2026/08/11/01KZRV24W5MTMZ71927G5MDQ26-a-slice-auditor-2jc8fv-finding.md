---
id: 01KZRV24W5MTMZ71927G5MDQ26
kind: event
event_kind: finding
created: 2026-08-11T16:39:01Z
created_by: a-slice-auditor-2jc8fv
about: "[[001]]"
origin: agent
applied: false
---
Cloning a published nota produces an empty document but toasts success

clonePublishedNota (nota.ts:1264-1456) is reachable from PublicNotaView.vue:339. It creates the new Nota row and pushes to items, then at 1311-1324 obtains blockStore and — instead of converting the published TipTap content into blocks — only logs 'Content conversion not yet implemented for block system' (TODO line 1319). It never calls blockStore.importTiptapContent. Same for each cloned sub-nota (1372-1384, TODO 1379) and the page-link ID remap (1438-1441, TODO 1439). Because blocks are the authoritative content model, the clone has an empty block structure and renders blank. Yet line 1448 toasts 'cloned successfully with all sub-pages'. User-visible: 'Clone' on any public nota yields blank notas while claiming success. Contrast the working path: nota.ts import (581/605/1006) DOES call blockStore.importTiptapContent — clone was simply never finished.
