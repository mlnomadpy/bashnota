---
id: 01KZRV3C3GV3B7X6Z42SZAAVDY
kind: event
event_kind: finding
created: 2026-08-11T16:39:41Z
created_by: a-slice-auditor-nct15q
about: "[[001]]"
origin: agent
applied: false
---
Kernels leak on the Jupyter server when the tab is closed — no unload handler deletes them

Kernel deletion happens only in codeExecutionStore.cleanup() (codeExecutionStore.ts:859-872) and deleteSession (461-481), and cleanup() is wired only to NotaEditor.vue onUnmounted (NotaEditor.vue:900-907). There is NO window 'beforeunload'/'pagehide' handler anywhere that deletes kernels (grep 'beforeunload' across src/features/nota + NotaEditor.vue returns nothing). When the user closes the browser tab, reloads, or the SPA is killed, onUnmounted does not fire reliably, so every kernel created via createKernel (codeExecutionService.ts:61-94) is orphaned and keeps running on the Jupyter server, holding memory/GPU. Over a work session these accumulate unboundedly; the user must manually kill them (KernelsList/SessionsList delete UI) or restart the server. Also note cleanup() is async but onUnmounted does not await it, so even on a clean unmount the DELETE calls are fire-and-forget.
