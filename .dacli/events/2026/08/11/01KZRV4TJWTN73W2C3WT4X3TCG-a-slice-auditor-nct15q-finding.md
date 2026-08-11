---
id: 01KZRV4TJWTN73W2C3WT4X3TCG
kind: event
event_kind: finding
created: 2026-08-11T16:40:29Z
created_by: a-slice-auditor-nct15q
about: "[[001]]"
origin: agent
applied: false
---
WebSocket error path never closes the socket and can double-settle the promise

In executeNotebookBlocks (codeExecutionService.ts:211-220), ws.onerror calls reject('WebSocket error') but never ws.close(); the socket may linger until GC/network timeout. Separately, onerror and onclose can both fire for the same failure — onclose then also calls reject('WebSocket closed before execution completed') when currentBlockIndex < length. The second reject is a no-op on an already-settled promise, but combined with the missing close() it means a failed execution leaves an un-closed WebSocket and logs a misleading secondary error. Minor resource/log-noise issue; becomes material under the kernel-death scenario where onerror fires first.
