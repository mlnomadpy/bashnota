---
id: 01KZRV3V3YYQAEJ9D9RZBTCZJC
kind: event
event_kind: finding
created: 2026-08-11T16:39:57Z
created_by: a-slice-auditor-nct15q
about: "[[001]]"
origin: agent
applied: false
---
Two full kernel-execution implementations exist; the more robust one is dead, and both executeCode() methods are orphaned

The slice ships two parallel Jupyter execution stacks. (A) CodeExecutionService (src/services/codeExecutionService.ts) — used by the app via codeExecutionStore.executeNotebookBlocks; no timeout. (B) JupyterService.executeCode + processMessages (jupyterService.ts:383-518) — a self-contained execute-with-10s-timeout implementation that creates and tears down a kernel per call. A whole-repo grep for '.executeCode(' finds callers ONLY in localagents.ts (repo-root dead file the baseline already flagged). So JupyterService.executeCode, processMessages, its getWebSocketUrl (jupyterService.ts:368-381), AND CodeExecutionService.executeCode (codeExecutionService.ts:224-237) are all orphaned — zero importers in src/. Grade: dead. They diverge (B has a timeout, A does not; B uses uuid session ids, A reuses msg_id as session at codeExecutionService.ts:39/45), so a maintainer patching the wrong one fixes nothing. Consequence: ~135 LOC of confusing dead execution code masquerading as the real path.
