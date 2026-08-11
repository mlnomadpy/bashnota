---
id: 01KZRV6DXQJV86K5413NX4ZPMN
kind: event
event_kind: finding
created: 2026-08-11T16:41:22Z
created_by: a-slice-auditor-nct15q
about: "[[001]]"
origin: agent
applied: false
---
connectToSession/connectToKernel are stubs — clicking a running session/kernel in the sidebar does nothing but toast

useJupyterSessions.ts:156-165: connectToSession(sessionId) and connectToKernel(server,kernelName) each only call showToast(...) followed by a comment '// Additional connection logic can be added here'. They do not attach the block/cell to the selected running kernel or set any session state. These are surfaced in the Jupyter Servers sidebar (SessionsList.vue / KernelsList.vue). User-visible: a user who has an existing running kernel/session on the server and clicks it to reuse it gets a 'Connected to ...' toast but the code block is NOT actually bound to that kernel — the app will still create a brand-new kernel on next run. Feature is stubbed, not wired.
