---
id: t-01M0F8AY4BFQ95CGSGX546K019
kind: task
created: 2026-08-20T09:34:18Z
created_by: a-root
owner: a-root
github:
  issue: 6
  repo: mlnomadpy/bashnota
estimate: "{optimistic: 5, probable: 8, pessimistic: 13}"
---
# Feature request: add complete pull-request CI and gated deployment
## Context
Adopted from GitHub issue #6.

## Objective

Create a complete pull-request quality pipeline and make deployment conditional on all required checks.

## Primary implementation areas

- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`
- Root and Functions package scripts

## Required checks

1. Checkout with pinned action revisions.
2. Set up the pinned Node 22 release.
3. Root `npm ci`.
4. `functions/` `npm ci`.
5. Non-mutating lint.
6. Type checking.
7. Frontend unit and integration tests.
8. Firebase Functions tests and build.
9. Firebase Rules emulator tests.
10. Production frontend build.
11. Playwright smoke test.
12. Production dependency audit and SBOM generation.
13. Coverage, test results, and bundle reports as artifacts.

## Required changes

- Run CI on pull requests and protected-branch pushes.
- Add concurrency cancellation for superseded runs.
- Cache dependencies without caching mutable build output.
- Separate fast checks from slower emulator/E2E checks while requiring both for release.
- Remove `build-only` from the deployment path.
- Make deployment consume the already-verified build artifact.
- Use least-privilege workflow permissions and environment protection for deployment secrets.

## Acceptance criteria

- A failing type check, test, lint check, security gate, or backend build prevents deployment.
- CI succeeds from a clean fork without undocumented local configuration.
- Artifacts make failures reproducible without exposing secrets.
- Branch protection requires the stable CI check names.
- README badges accurately reflect the current default-branch status.

## Acceptance
## Log
