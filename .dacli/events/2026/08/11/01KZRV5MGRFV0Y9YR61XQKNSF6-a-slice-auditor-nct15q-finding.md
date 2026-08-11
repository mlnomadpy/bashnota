---
id: 01KZRV5MGRFV0Y9YR61XQKNSF6
kind: event
event_kind: finding
created: 2026-08-11T16:40:56Z
created_by: a-slice-auditor-nct15q
about: "[[001]]"
origin: agent
applied: false
---
LIFECYCLE INVENTORY: every WebSocket/interval/listener in the execution path and its cleanup status

WebSockets: (a) codeExecutionService.ts:126 in executeNotebookBlocks — closed on success (191) and on batch-complete, but NOT closed on ws.onerror (211-214) [leak on error]; it is a local var so cleanup()/deleteSession cannot close an in-flight socket. (b) jupyterService.ts:398 in JupyterService.executeCode — closed on idle/error/10s-timeout, but this whole method is DEAD (no src caller). Intervals: NONE in the jupyter execution path itself (setTimeout only exists in the dead jupyterService.executeCode:453). Listeners: the jupyter slice adds none of its own window/document listeners; the surrounding NotaEditor.vue adds document 'keydown' + window 'activate-ai-assistant'/'open-jupyter-sidebar' + document 'open-markdown-input' in onMounted (807+) and 'removes' them in onUnmounted (900-905) but with fresh anonymous functions so removeEventListener is a no-op (already filed by the vue-reviewer seat). Kernels (server-side resources): created at codeExecutionService.ts:61; deleted only via cleanup() (859-872, onUnmounted only) and deleteSession (461-481) — no beforeunload path (see kernel-leak finding). Net: the execution path has one un-cancellable WebSocket per run and one server kernel per session, neither reliably torn down on navigate-away/tab-close.
