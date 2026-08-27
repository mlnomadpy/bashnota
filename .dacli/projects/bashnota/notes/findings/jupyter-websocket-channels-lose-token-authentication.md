---
id: f-jupyter-websocket-channels-lose-token-authentication
kind: note
note_kind: finding
created: 2026-08-27T09:47:40Z
created_by: a-root
about: "[[bashnota/048-redact-credentials-and-harden-ai-and-jupyter-trust-boundaries]]"
severity: major
---
# Jupyter WebSocket channels lose token authentication
jupyterSecurity builds token-free WebSocket URLs and browser WebSocket cannot send Authorization headers; JupyterService and CodeExecutionService call new WebSocket(url). Standard token-auth kernel channels therefore cannot connect. Require a controlled authenticated websocket boundary or explicitly safe protocol mechanism without exposing tokens in logs/history, plus real fake-server handshake tests.
