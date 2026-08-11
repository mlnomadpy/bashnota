---
id: d-focused-the-audit-on-execution-lifecycle-timeout-interrupt-cleanup-leaks-races
kind: note
note_kind: decision
created: 2026-08-11T16:41:54Z
created_by: a-slice-auditor-nct15q
about: "[[001]]"
---
# Focused the audit on execution lifecycle (timeout/interrupt/cleanup/leaks/races) and endpoint binding, not token/XSS
## Chose
Focused the audit on execution lifecycle (timeout/interrupt/cleanup/leaks/races) and endpoint binding, not token/XSS
## Rejected
Re-auditing the token-in-URL/plaintext-token and OutputRenderer v-html XSS surfaces
## Because
The security seat already filed 'Jupyter token sent in URL query, forced over http, and logged' and multiple v-html XSS findings (OutputRenderer/ErrorDisplay). Per the brief's 'comprehension before criticism / don't re-find siblings' rule I went where they did not: the WebSocket/kernel lifecycle, singleton cleanup blast radius, run-all/shared-session correctness, dead dual transport, and how NotaConfig binds (or fails to bind) a kernel endpoint for shared notas.
