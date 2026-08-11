---
id: 01KZRV69AXZKG7ZN0T7TF0NJS4
kind: event
event_kind: finding
created: 2026-08-11T16:41:17Z
created_by: a-slice-auditor-nct15q
about: "[[001]]"
origin: agent
applied: false
---
CAPABILITY GRADING of the jupyter slice (complete/partial/stubbed/dead/orphaned)

Server CRUD + persistence (jupyterStore.ts, useJupyterServers.ts): COMPLETE — add/remove/list/testConnection/parseJupyterUrl, localStorage-backed. Kernel discovery getAvailableKernels (jupyterService.ts:354): COMPLETE (cached in store 82-106). Single-cell execution (codeExecutionService.executeNotebookBlocks via store.executeCell): PARTIAL — works but missing timeout, interrupt/stop, and reliable teardown (see findings). Run All (executeAll, codeExecutionStore.ts:770): PARTIAL — silently skips cells without a session (774-781). Shared-session mode (toggleSharedSessionMode/ensureSharedSession/applySharedSessionToCell): PARTIAL — functional but racy and duplicated across three code paths (247, 328, 592). Sessions/running-kernels browser (useJupyterSessions.ts, SessionsList.vue, KernelsList.vue): COMPLETE for delete; connectToSession/connectToKernel (useJupyterSessions.ts:156-165) are STUBBED — they only toast, no real attach ('Additional connection logic can be added here'). File browser (browseDirectory/getFileContent + Direct variants, jupyterService.ts:68-161,606-661): COMPLETE, used by confusion-matrix JupyterFileBrowser.vue. CSV filter helpers (166-177): COMPLETE. JupyterService.executeCode + processMessages + its getWebSocketUrl (383-518,368-381) and CodeExecutionService.executeCode (224-237): DEAD (only localagents.ts, a dead root file, references them). getConnectedServers/browseDirectory-by-id connection cache (18,59-63): ORPHANED relative to the Direct* variants the UI actually calls.
