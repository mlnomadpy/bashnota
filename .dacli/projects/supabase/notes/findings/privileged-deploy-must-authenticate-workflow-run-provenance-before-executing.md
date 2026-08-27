---
id: f-privileged-deploy-must-authenticate-workflow-run-provenance-before-executing
kind: note
note_kind: finding
created: 2026-08-19T13:30:19Z
created_by: a-root
about: "[[015]]"
severity: major
---
# Privileged deploy must authenticate workflow_run provenance before executing its SHA
Independent review found that pinning workflow_run.head_sha without requiring a same-repository push to master could execute untrusted fork PR content in a write-privileged workflow. Repaired in .github/workflows/deploy.yml and locked by scripts/deploy-workflow.self-test.mjs.
