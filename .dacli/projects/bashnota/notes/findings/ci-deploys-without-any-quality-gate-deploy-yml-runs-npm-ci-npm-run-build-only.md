---
id: f-ci-deploys-without-any-quality-gate-deploy-yml-runs-npm-ci-npm-run-build-only
kind: note
note_kind: finding
created: 2026-08-11T16:16:02Z
created_by: a-root
origin: .github/workflows/deploy.yml:31
---
# CI deploys without any quality gate: deploy.yml runs 'npm ci && npm run build-only', deliberately skipping type-check, and never runs tests or lint. This is why the failing type-check and 5 failing tests are sitting on master.
