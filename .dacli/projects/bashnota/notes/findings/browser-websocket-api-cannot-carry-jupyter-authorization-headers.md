---
id: f-browser-websocket-api-cannot-carry-jupyter-authorization-headers
kind: note
note_kind: finding
created: 2026-08-27T09:53:10Z
created_by: a-security-fixer-sk5tgf
about: "[[t-01M10BZYVVK03HWKPG17RXAVSV]]"
severity: major
---
# Browser WebSocket API cannot carry Jupyter authorization headers
src/features/jupyter/services/jupyterSecurity.ts:61-68 constructed token-free channel URLs, while src/features/jupyter/services/jupyterService.ts:389 and src/services/codeExecutionService.ts:124 call the browser WebSocket constructor, which has no headers parameter. Token-authenticated kernels would otherwise require URL credentials or open unauthenticated channels; the boundary now refuses token-authenticated browser WebSockets.
