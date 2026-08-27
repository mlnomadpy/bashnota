---
id: d-route-the-complete-pipeline-execution-logging-surface-through-the-central
kind: note
note_kind: decision
created: 2026-08-27T10:11:46Z
created_by: a-security-fixer-pz04by
about: "[[t-01M10BZYVVK03HWKPG17RXAVSV]]"
---
# Route the complete pipeline execution logging surface through the central redacting logger
## Chose
Route the complete pipeline execution logging surface through the central redacting logger
## Rejected
Redact only the one server-result argument at its current call site
## Because
Pipeline catches can also receive transport errors carrying authorization headers or credential-bearing URLs; using the same central boundary for all pipeline diagnostics prevents equivalent leakage variants.
