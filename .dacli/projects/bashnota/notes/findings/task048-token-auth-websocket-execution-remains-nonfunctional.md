---
id: f-task048-token-auth-websocket-execution-remains-nonfunctional
kind: note
note_kind: finding
created: 2026-08-27T10:32:04Z
created_by: a-root
about: "[[bashnota/048-redact-credentials-and-harden-ai-and-jupyter-trust-boundaries]]"
severity: major
origin: src/features/jupyter/services/jupyterSecurity.ts:63
---
# Task048 token-auth WebSocket execution remains nonfunctional
Exact f926088 rejects every token-bearing WebSocket. Implement a supported secure cookie or same-origin proxy bootstrap and integration-test token-protected HTTP+WS execution with no URL/log/storage leakage.
