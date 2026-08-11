---
id: 01KZRV4A0DHVVF6MS0CP29A5VR
kind: event
event_kind: finding
created: 2026-08-11T16:40:12Z
created_by: a-slice-auditor-nct15q
about: "[[001]]"
origin: agent
applied: false
---
Streaming output is attributed by array index, not by parent msg_id — misroutes output in multi-cell runs

In executeNotebookBlocks the onmessage handler correctly looks up per-message state by parentMsgId (codeExecutionService.ts:143-145), but the streaming callback fires with codeBlocks[currentBlockIndex].id (line 205-207), a shared mutable index, instead of resolving the block that owns parentMsgId. currentBlockIndex is incremented inside the 'status'/idle branch (line 180) BEFORE the trailing onOutput call runs. For a single-cell execution (the executeCell path always passes one block) this is harmless. But executeAll batches many blocks into one WebSocket per session (codeExecutionStore.ts:799-826): any output message that arrives after the idle-driven increment — Jupyter can emit trailing stream/display_data after status — is streamed onto codeBlocks[currentBlockIndex], i.e. the NEXT cell, or codeBlocks[length] (undefined -> throws). User-visible: with Run All, one cell's stdout/plot can appear under the following cell, or a late message throws and aborts the batch.
