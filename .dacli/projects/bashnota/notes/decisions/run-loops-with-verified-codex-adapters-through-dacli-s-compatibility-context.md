---
id: d-run-loops-with-verified-codex-adapters-through-dacli-s-compatibility-context
kind: note
note_kind: decision
created: 2026-08-27T22:31:52Z
created_by: a-root
---
# Run loops with verified Codex adapters through dacli's compatibility context path
## Chose
Run loops with verified Codex adapters through dacli's compatibility context path
## Rejected
Blocking all loop execution until dacli forwards --allow-user-config to worker spawns
## Because
The operator explicitly requested dacli loops; the compatibility path preserves the verified Codex sandbox and launch contract while workers inherit this operator's existing Codex config, skills, plugins, and MCP context.
