---
id: 01KZRV5W2P2254HMPENQAA95NF
kind: event
event_kind: finding
created: 2026-08-11T16:41:03Z
created_by: a-slice-auditor-nct15q
about: "[[001]]"
origin: agent
applied: false
---
NAVIGATE-AWAY / TAB-CLOSE / KERNEL-DEATH behavior of a running execution

Navigate away (route change / pane closes): NotaEditor onUnmounted (NotaEditor.vue:906) calls codeExecutionStore.cleanup() -> clears ALL cells/sessions and fires kernel DELETEs (not awaited). The in-flight executeNotebookBlocks WebSocket (codeExecutionService.ts:126) is a local var cleanup() cannot reach, so it stays open until the server closes it after the kernel DELETE lands; the cell object is already gone, so any resolve/reject is dropped. In split view this also destroys OTHER panes (see singleton-cleanup finding). Close tab / reload: onUnmounted is not guaranteed to run and there is no beforeunload handler, so the kernel is orphaned on the server and the WebSocket dies with the page (see kernel-leak finding). Kernel dies mid-run: server closes the WebSocket -> ws.onclose (codeExecutionService.ts:216-220) sees currentBlockIndex<length -> rejects 'WebSocket closed before execution completed' -> executeCell catch (758) sets cell.hasError + shows the raw message; isExecuting cleared in finally. There is NO reconnect and NO detection of a kernel that dies while idle: session.kernelId is retained, so the NEXT run reuses the dead kernelId, the new WebSocket connect fails (onerror -> reject), and only then does the user see an error — with no automatic kernel re-creation.
