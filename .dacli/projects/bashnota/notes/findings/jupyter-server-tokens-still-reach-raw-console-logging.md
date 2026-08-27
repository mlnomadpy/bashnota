---
id: f-jupyter-server-tokens-still-reach-raw-console-logging
kind: note
note_kind: finding
created: 2026-08-27T09:47:40Z
created_by: a-root
about: "[[bashnota/048-redact-credentials-and-harden-ai-and-jupyter-trust-boundaries]]"
severity: major
---
# Jupyter server tokens still reach raw console logging
At 7a7da0b, ExecutableCodeBlock.vue and JupyterServersSidebarContent.vue pass memory-resident server objects containing token directly to console.log. Central logger redaction cannot protect raw console calls. Route all logging through redaction and add mounted/runtime leakage tests.
