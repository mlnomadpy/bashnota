---
id: 01KZRV5A07MCEHY4NNHTRDPVY4
kind: event
event_kind: finding
created: 2026-08-11T16:40:45Z
created_by: a-slice-auditor-nct15q
about: "[[001]]"
origin: agent
applied: false
---
TRACE: one code execution from Run button to output render, across editor/jupyter/services

Full ordered path (press Run -> render): (1) User clicks run in ExecutableCodeBlock.vue; UI composable useCodeBlockExecutionSimplified.ts exposes executeCode which delegates to core/useCodeExecution.ts:74 executeCode(). (2) core/useCodeExecution.ts:84 -> codeExecutionStore.executeCell(blockId) (codeExecutionStore.ts:573). (3) executeCell validates serverConfig/kernelName (679-695), sets cell.isExecuting=true (697-701). (4) Session resolve: existing cell.sessionId -> kernelSessions.get; if no kernelId -> createKernelSession (525-571) -> executionService.createKernel (codeExecutionService.ts:61-94) POST /api/kernels via getUrlWithToken (fetch). (5) executeCell:730 -> executionService.executeNotebookBlocks (codeExecutionService.ts:118). (6) new WebSocket(getWebSocketUrl) (126) -> ws.onopen sends execute_request built by createExecuteRequestMessage (38-59). (7) ws.onmessage (138) dispatches stream/execute_result/display_data/error/status; builds output string incl. raw text/html and <img base64> (150-173); streams via onOutput callback (205) -> executeCell closure (734-742) appends to cell.output; on status/idle resolves (176-199). (8) executeCell:749 copies result.output/hasError onto the cell; core/useCodeExecution.ts:91 props.updateAttributes({output}) writes back into TipTap attrs. (9) OutputRenderer.vue renders cell.output (v-html — see security seat's XSS findings on this sink). Entry points into the store: NotaEditor.vue registerCodeCellsOnDemand (303) + loadSavedSessions (421); NotaView/NotaPane 'Run All' -> executeAll (770).
