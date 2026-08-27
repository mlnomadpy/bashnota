---
id: f-token-authenticated-jupyter-execution-now-bootstraps-cookie-backed-websockets
kind: note
note_kind: finding
created: 2026-08-27T10:49:00Z
created_by: a-security-fixer-nvhwty
about: "[[t-01M10BZYVVK03HWKPG17RXAVSV]]"
severity: major
trust: refuted
---
# Token-authenticated Jupyter execution now bootstraps cookie-backed WebSockets on both clients
src/features/jupyter/services/jupyterSecurity.ts:42-57 centralizes credentialed, no-redirect HTTP requests and src/features/jupyter/services/jupyterSecurity.ts:90-95 produces credential-free same-origin WS/WSS channel URLs. src/features/jupyter/services/jupyterService.ts:322-324 enables Axios cookie acceptance; src/services/codeExecutionService.ts:56-68 uses the same header-only bootstrap. Deterministic HTTP+WS flow tests cover both clients.
