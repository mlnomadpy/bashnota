---
id: f-task048-validates-a-different-jupyter-target-than-it-fetches
kind: note
note_kind: finding
created: 2026-08-27T10:32:04Z
created_by: a-root
about: "[[bashnota/048-redact-credentials-and-harden-ai-and-jupyter-trust-boundaries]]"
severity: moderate
origin: src/features/jupyter/services/jupyterService.ts:217
---
# Task048 validates a different Jupyter target than it fetches
server.ip is validated but server.url is preferred for authenticated fetch. Canonicalize and validate/confirm the exact final origin before any request.
