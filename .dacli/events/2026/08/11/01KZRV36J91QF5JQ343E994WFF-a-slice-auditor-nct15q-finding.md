---
id: 01KZRV36J91QF5JQ343E994WFF
kind: event
event_kind: finding
created: 2026-08-11T16:39:36Z
created_by: a-slice-auditor-nct15q
about: "[[001]]"
origin: agent
applied: false
---
Singleton codeExecutionStore.cleanup() wipes ALL panes' cells and kernels when ANY editor unmounts

codeExecutionStore is one Pinia singleton (codeExecutionStore.ts:12). Its cleanup() (codeExecutionStore.ts:859-872) does kernelSessions.value.clear() and cells.value.clear() for the WHOLE app and DELETEs every kernel. NotaEditor.vue calls this unconditionally in onUnmounted (NotaEditor.vue:906). But SplitViewContainer.vue mounts up to FOUR NotaPane/NotaEditor instances at once (SplitViewContainer.vue:5-25, layoutStore.panes.length 1..>=4). So closing one split pane, or navigating one pane to a different nota, unmounts that editor and runs cleanup() — which clears the OTHER still-open panes' cells (their outputs vanish) and deletes their running kernels mid-session. User-visible: in split view, editing/closing pane A silently kills pane B's kernel and erases pane B's rendered outputs. Even in single-pane, cleanup() races nota-to-nota navigation because the store is global.
