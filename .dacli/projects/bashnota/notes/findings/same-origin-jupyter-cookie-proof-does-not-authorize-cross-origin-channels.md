---
id: f-same-origin-jupyter-cookie-proof-does-not-authorize-cross-origin-channels
kind: note
note_kind: finding
created: 2026-08-27T11:20:12Z
created_by: a-root
about: "[[bashnota/048-redact-credentials-and-harden-ai-and-jupyter-trust-boundaries]]"
severity: major
origin: src/features/jupyter/services/jupyterSecurity.ts:90
---
# Same-origin Jupyter cookie proof does not authorize cross-origin channels
Independent exact-head review at 44351e2 proved the browser gate's same-origin cookie handoff but reproduced that a distinct-origin page cannot present a SameSite/third-party Jupyter cookie on the WebSocket upgrade. Repair must fail closed for token-bearing cross-origin channels or use a production-supported proxy; token URLs remain forbidden.
