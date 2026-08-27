---
id: f-pipeline-execution-logged-credential-bearing-jupyter-server-results-outside
kind: note
note_kind: finding
created: 2026-08-27T10:11:46Z
created_by: a-security-fixer-pz04by
about: "[[t-01M10BZYVVK03HWKPG17RXAVSV]]"
severity: major
---
# Pipeline execution logged credential-bearing Jupyter server results outside redaction
src/features/editor/components/blocks/pipeline/PipelineNode.vue:1536 passed getFirstAvailableServer()'s full result, including server.token, to raw console.log; the component now routes execution diagnostics and errors through src/services/logger.ts:31-63 so recursive redaction applies.
