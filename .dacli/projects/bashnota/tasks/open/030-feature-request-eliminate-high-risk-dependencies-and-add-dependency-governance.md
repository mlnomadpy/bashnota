---
id: t-01M0F8AY6847EJGVZSZ57X309Z
kind: task
created: 2026-08-20T09:34:18Z
created_by: a-root
owner: a-root
github:
  issue: 3
  repo: mlnomadpy/bashnota
estimate: "{optimistic: 5, probable: 8, pessimistic: 13}"
---
# Feature request: eliminate high-risk dependencies and add dependency governance
## Context
Adopted from GitHub issue #3.

## Objective

Remove known high and critical runtime vulnerabilities, reduce unnecessary production dependencies, and establish continuous dependency governance.

## Audit baseline

The August 2026 clean-clone audit found high/critical advisories in both the root application and Firebase Functions dependency trees. Direct packages requiring review include `axios`, `ws`, `express`, `firebase`, `firebase-admin`, `dompurify`, `mermaid`, `uuid`, and the accidentally bundled `npm` package.

## Primary implementation areas

- `package.json`
- `package-lock.json`
- `functions/package.json`
- `functions/package-lock.json`
- `.github/dependabot.yml` or equivalent Renovate configuration

## Required changes

- Remove unused production dependencies `i`, `install`, and `npm` after verifying no imports exist.
- Upgrade direct dependencies before applying transitive overrides.
- Upgrade Firebase client, Admin SDK, and Functions packages with emulator and integration testing.
- Upgrade Express and retest every API route and middleware behavior.
- Upgrade DOMPurify and rerun the content-security regression corpus.
- Regenerate both lockfiles from clean installs.
- Use `npm dedupe` where it reduces duplicate vulnerable versions without changing behavior.
- Add automated dependency update pull requests with grouped, reviewable changes.
- Generate an SBOM and third-party license inventory in CI.
- Document time-bounded exceptions for advisories that cannot immediately be removed.

## Acceptance criteria

- Clean production-only audits contain no unexplained high or critical advisory.
- `npm ci` succeeds reproducibly in both root and `functions/`.
- Frontend, backend, emulator, and E2E tests pass after upgrades.
- Dependency changes are separated into reviewable commits with migration notes where behavior changes.
- CI publishes machine-readable audit, SBOM, and license artifacts.

## Acceptance
## Log
