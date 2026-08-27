---
id: f-jupyter-managed-server-url-bypasses-validated-origin
kind: note
note_kind: finding
created: 2026-08-27T09:48:10Z
created_by: a-root
about: "[[bashnota/048-redact-credentials-and-harden-ai-and-jupyter-trust-boundaries]]"
severity: moderate
---
# Jupyter managed-server URL bypasses validated origin
jupyterService confirms and validates server.ip but prefers an unvalidated server.url for requests. A local ip plus remote/insecure url bypasses HTTPS and remote confirmation and receives the token header. Canonicalize and validate the actual final target; test local-ip/remote-url and HTTPS-to-HTTP mismatch.
