---
id: 01KZRV3M7GZM9Q6S6AMC0TWP8T
kind: event
event_kind: finding
created: 2026-08-11T16:39:50Z
created_by: a-slice-auditor-nct15q
about: "[[001]]"
origin: agent
applied: false
---
'Run All' silently skips every cell that has not been individually run

executeAll() (codeExecutionStore.ts:770-781) groups cells by session with: 'for (const cell of cells.value.values()) { if (!cell.serverConfig || !cell.sessionId) continue; ... }'. A freshly-registered cell has serverConfig set from attrs only if a matching server exists in localStorage, and sessionId is empty until the cell has been executed once (executeCell assigns a session at 715-722) or shared-session mode has been applied. So clicking the 'Run All' button (wired via NotaView.vue:88-91 / NotaPane.vue:283-286 -> codeExecutionStore.executeAll) does NOTHING for any cell the user has not already run once individually — no error, no toast, no output. User-visible: 'Run All' appears to work but quietly executes only a subset (often zero) of the notebook's cells.
