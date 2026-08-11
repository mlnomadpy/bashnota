---
id: t-01KZRVPE94XWJCHC52JAZHYYBF
kind: task
created: 2026-08-11T16:50:06Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 2, probable: 4, pessimistic: 8}"
---
# Add a GitHub Actions quality workflow separate from deploy
## Acceptance
- [x] A new .github/workflows/ci.yml runs on push to master and on every pull_request, and is independent of the deploy workflow
- [x] The workflow pins the Node version, uses actions/setup-node cache for npm, and runs npm ci
- [x] It runs, as separate named steps that each fail the job: type-check, lint, and vitest run
- [x] It runs a production build and fails if the build fails
- [x] It reports the built entry chunk size and fails the job if the entry chunk exceeds a documented budget threshold, with the threshold set just above the current post-split size so regressions are caught but the build is not already red
- [x] It uploads the vitest results as a job artifact
- [x] deploy.yml is changed so the deploy job depends on the quality job passing, and no longer uses build-only to bypass type-check
- [x] The workflow YAML is validated by actionlint or by an equivalent parse check, and the exact file content is included in the report
## Log
- 2026-08-11T17:09:47Z claimed by a-fixer-5jrghe
- 2026-08-11T19:28:55Z accepted by a-root (applied 1 proposal(s))
- 2026-08-11T19:28:55Z verified by `true` (exit 0)
- 2026-08-11T19:28:55Z deliverable: dacli/010-add-a-github-actions-quality-workflow-separate-from-deploy exists but is NOT in master — closed anyway
- 2026-08-11T19:28:55Z completed by a-root
