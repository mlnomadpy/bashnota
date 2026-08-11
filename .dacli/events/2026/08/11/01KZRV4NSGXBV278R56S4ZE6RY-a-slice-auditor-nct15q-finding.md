---
id: 01KZRV4NSGXBV278R56S4ZE6RY
kind: event
event_kind: finding
created: 2026-08-11T16:40:24Z
created_by: a-slice-auditor-nct15q
about: "[[001]]"
origin: agent
applied: false
---
Kernel endpoint binding is a per-machine ip:port string in block attrs, not in NotaConfig — shared notas bind to the viewer's own machine or silently fail

How endpoints are configured: server credentials (ip/port/token) live ONLY in a global localStorage key 'jupyter-servers' (jupyterStore.ts:15-38), never in the nota. A code block persists just a serverID = 'ip:port' string plus kernelName in its TipTap attrs (ExecutableCodeBlockExtension.ts:25; set via useCodeExecution.onKernelSelect at core/useCodeExecution.ts:104-107). At execution, registerCodeCells resolves serverID against localStorage by matching ip:port (codeExecutionStore.ts:419-421); NotaConfig itself stores no endpoint — only savedSessions {id,name,isShared}, sharedSessionMode/Id, and per-block kernelPreferences (types/jupyter.ts:56-75). Implication when a nota is shared/published: the block still carries the author's serverID (commonly 'localhost:8888'). On the viewer's machine servers.find() returns undefined -> cell.serverConfig is undefined -> executeCell errors with 'No server configuration' (codeExecutionStore.ts:679-686). If the viewer happens to run their own server at the same ip:port, execution silently targets THEIR local kernel instead. So a nota cannot portably specify its own kernel endpoint, and 'run' on a shared nota is non-functional or machine-dependent by design. (Token-in-URL/plaintext concerns are already owned by the security seat; not re-filed here.)
