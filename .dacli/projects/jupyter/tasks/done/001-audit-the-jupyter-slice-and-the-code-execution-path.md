---
id: t-01KZRTN4XTV36BP2JWQFY0HNRV
kind: task
created: 2026-08-11T16:31:55Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 3, probable: 5, pessimistic: 10}"
---
# Audit the jupyter slice and the code execution path
## Acceptance
- [x] Traces one complete code execution from the user pressing run to output rendering, naming every function and file:line in order across the editor, jupyter and services layers
- [x] States how kernel endpoints are configured, whether a nota can specify its own endpoint via NotaConfig, and what that means if a nota is shared
- [x] Reports every WebSocket, interval and listener created in this path and whether each is cleaned up, with file:line
- [x] States what happens to a running execution when the user navigates away, closes the tab, or the kernel dies
- [x] Grades every jupyter capability complete/partial/stubbed/dead/orphaned
- [x] Reports at least 5 defects with file:line and user-visible consequence
- [x] Every finding filed via 'dacli note add finding --project jupyter --about <task>' with a file:line origin
## Log
- 2026-08-11T16:34:47Z claimed by a-slice-auditor-8sc6ap
- 2026-08-11T19:45:11Z accepted by a-root (applied 1 proposal(s))
- 2026-08-11T19:45:11Z verified by `grep -rlq t-01KZRTN4XTV36BP2JWQFY0HNRV .dacli/events` (exit 0)
- 2026-08-11T19:45:11Z deliverable: no dacli/001-audit-the-jupyter-slice-and-the-code-execution-path branch — nothing to check against master
- 2026-08-11T19:45:11Z completed by a-root
