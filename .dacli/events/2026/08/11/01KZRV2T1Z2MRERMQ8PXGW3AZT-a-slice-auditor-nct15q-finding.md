---
id: 01KZRV2T1Z2MRERMQ8PXGW3AZT
kind: event
event_kind: finding
created: 2026-08-11T16:39:23Z
created_by: a-slice-auditor-nct15q
about: "[[001]]"
origin: agent
applied: false
---
No execution timeout or interrupt in the primary code path — hung kernel = permanent spinner

The only execution path the app actually uses is CodeExecutionService.executeNotebookBlocks (src/services/codeExecutionService.ts:118-222), reached via codeExecutionStore.executeCell -> executeNotebookBlocks (codeExecutionStore.ts:730). That method opens a WebSocket and resolves ONLY when a 'status'/execution_state==='idle' message arrives (codeExecutionService.ts:175-201). There is NO setTimeout and NO kernel /interrupt call anywhere in this path (grep for 'interrupt' returns zero hits in the jupyter/editor execution code). If the cell runs 'while True: pass', time.sleep(large), or the kernel stalls, the promise never settles, cell.isExecuting stays true forever, and the UI spinner never stops. There is also no Stop button wired to Jupyter's interrupt API — FullScreenCodeBlock.vue:223 'stopExecutionTimer' only stops a UI clock, not the kernel. Note the legacy JupyterService.executeCode (jupyterService.ts:453-456) DOES have a 10s timeout, but that path is dead (see separate finding). User-visible: a runaway or long cell hangs the block with no way to cancel short of reloading the page.
