---
id: 01KZRV43SZ6VH54CQGZMNCEX1G
kind: event
event_kind: finding
created: 2026-08-11T16:40:06Z
created_by: a-slice-auditor-nct15q
about: "[[001]]"
origin: agent
applied: false
---
Shared-session mode races: concurrent cells create duplicate kernels because session creation is not guarded

In shared-session mode, executeCell inlines its own shared-session bootstrap (codeExecutionStore.ts:591-662): if sharedSessionId.value is null it generates a new id, tests servers, and creates a kernel session. This block is fully async with multiple awaits (testConnection at 617, getAvailableKernels at 625, createKernelSession later) and NO lock/in-flight guard. If the user hits Run on two cells in quick succession (or Run All in shared mode), both invocations observe sharedSessionId===null, both fall through, and each creates a separate session + kernel on the server (createKernel, codeExecutionService.ts:61). Result: orphaned duplicate kernels, and cells split across two 'shared' sessions so variable state is not actually shared. The parallel ensureSharedSession() path (246-325) has the same shape. User-visible: intermittent 'NameError: X is not defined' between cells that were supposed to share state, plus leaked kernels.
