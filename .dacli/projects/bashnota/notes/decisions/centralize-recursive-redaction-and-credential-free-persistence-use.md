---
id: d-centralize-recursive-redaction-and-credential-free-persistence-use
kind: note
note_kind: decision
created: 2026-08-27T02:31:34Z
created_by: a-security-fixer-rr8a25
about: "[[t-01M10BZYVVK03HWKPG17RXAVSV]]"
---
# Centralize recursive redaction and credential-free persistence; use authorization headers and an explicit Jupyter trust policy
## Chose
Centralize recursive redaction and credential-free persistence; use authorization headers and an explicit Jupyter trust policy
## Rejected
Patch individual log messages while retaining query credentials and durable keys
## Because
Boundary helpers at logging, persistence, HTTP transport, WebSocket construction, and execution authorization cover all current callers and deterministic tests can enforce each boundary.
