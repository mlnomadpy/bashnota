---
id: f-production-jupyter-execution-outputs-bypass-the-gated-logger
kind: note
note_kind: finding
created: 2026-08-28T12:18:29Z
created_by: a-root
about: "[[032-feature-request-secure-published-content-and-executable-output-rendering]]"
severity: major
---
# Production Jupyter execution outputs bypass the gated logger
CodeBlockWithExecution.vue and useCodeBlockExecutionSimplified.ts send full execution outputs directly to console.log on normal execution and persistence paths. The production bundle retains those statements, risking notebook-data disclosure. Route only metadata through the gated/redacting logger and add console-spy regressions.
