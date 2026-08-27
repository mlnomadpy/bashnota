---
id: f-jupyter-browser-gate-exercises-a-handwritten-fixture-rather-than-production
kind: note
note_kind: finding
created: 2026-08-27T11:38:58Z
created_by: a-root
about: "[[048]]"
severity: major
scope: project
origin: e2e/jupyter-auth.browser.ts:71
---
# Jupyter browser gate exercises a handwritten fixture rather than production clients
Independent exact-head review found that the two-origin Chrome page implements its own rejection/fetch/WebSocket logic and never invokes jupyterSecurity.ts, JupyterService, or CodeExecutionService. Source-grep structural checks plus unit tests are insufficient for the required production-shaped application gate. Repair by bundling/importing the production transport policy/client seam into the browser harness and mutation-test that linkage. Before final review, merge current master so Netlify headers and task046 API-security migration/tests are preserved rather than appearing deleted by branch divergence.
