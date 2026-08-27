---
id: f-deployment-actions-are-mutable-and-stale-successful-runs-may-redeploy-old
kind: note
note_kind: finding
created: 2026-08-19T14:40:32Z
created_by: a-root
about: "[[011]]"
severity: major
---
# Deployment actions are mutable and stale successful runs may redeploy old commits
.github workflows use mutable action tags; deploy does not verify workflow_run.head_sha is still current master and concurrency does not cancel superseded deploys. A delayed run can roll production backward and mutable third-party code executes with write permission.
