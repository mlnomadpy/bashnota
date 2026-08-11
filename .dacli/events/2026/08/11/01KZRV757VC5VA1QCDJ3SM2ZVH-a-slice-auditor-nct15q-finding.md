---
id: 01KZRV757VC5VA1QCDJ3SM2ZVH
kind: event
event_kind: finding
created: 2026-08-11T16:41:45Z
created_by: a-slice-auditor-nct15q
about: "[[001]]"
origin: agent
applied: false
---
UPGRADES cheap because of how this slice is already built

1) Add timeout + interrupt with almost no new plumbing: executeNotebookBlocks already centralizes the WebSocket (codeExecutionService.ts:118); add a configurable idle timeout there and expose a returned handle {promise, cancel} that closes ws and POSTs /api/kernels/{id}/interrupt. executeCell already tracks cell.isExecuting, so a Stop button just calls cancel — no store restructuring needed. 2) Fix kernel leaks by reusing the existing cleanup(): register one window 'pagehide'/'beforeunload' that calls the SAME per-session deleteKernel loop (codeExecutionStore.ts:859-872) with navigator.sendBeacon for the DELETE. 3) Scope cleanup per-nota: cleanup() already iterates kernelSessions; add a notaId filter param so NotaEditor.onUnmounted only tears down its own nota's sessions — removes the split-view wipe with a one-line signature change. 4) Delete the dead transport: removing JupyterService.executeCode/processMessages/getWebSocketUrl and CodeExecutionService.executeCode (~135 LOC) is safe once localagents.ts is deleted (already flagged dead by baseline) — collapses the two-implementations confusion. 5) Deduplicate shared-session bootstrap: the same test-servers->pick-python->createKernelSession logic is copied at lines 133-206, 247-325, and 592-662; extract one guarded helper (with an in-flight promise) to also fix the duplicate-kernel race.
