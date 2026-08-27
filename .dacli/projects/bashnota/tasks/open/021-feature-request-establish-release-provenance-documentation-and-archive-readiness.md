---
id: t-01M0F8AY0M6F1RTPFFACX8RCJF
kind: task
created: 2026-08-20T09:34:18Z
created_by: a-root
owner: a-root
github:
  issue: 12
  repo: mlnomadpy/bashnota
estimate: "{optimistic: 3, probable: 5, pessimistic: 8}"
---
# Feature request: establish release, provenance, documentation, and archive readiness
## Context
Adopted from GitHub issue #12.

## Objective

Make BashNota reproducible, legally attributable, releaseable, and packageable with its complete authentic development history and collaboration metadata.

## Primary implementation areas

- `README.md`
- `CONTRIBUTING.md`
- `LICENSE`
- New `SECURITY.md`, `CHANGELOG.md`, `CODE_OF_CONDUCT.md`, `CODEOWNERS`, `NOTICE`, and `docs/architecture/`
- Release workflow and submission tooling

## Required changes

- Correct placeholder `your-repo` links and the `main` versus `master` inconsistency.
- Replace unsupported `npm run deploy` instructions with tested scripts.
- Document root and Functions installation, Firebase emulator setup, environment variables, Jupyter setup, and supported hosts.
- Add a security reporting policy and avoid placing sensitive vulnerability details in public issues.
- Create a contributor/provenance ledger that reconciles author aliases and automated-agent commits.
- Document the rights basis for significant human contributions and any generated-code review policy.
- Add an SBOM, dependency-license report, source/license notices, and fixture provenance.
- Remove `src/App.vue.backup`; classify and rename sample `.nota` files as fixtures or remove them after privacy review.
- Add architecture, data-flow, threat-model, backup/recovery, and format-compatibility documentation.
- Create a changelog and a signed/tagged release only after all release gates pass.
- Add a packaging script that creates one `.tar.gz` containing the required repository history without dependencies, build output, secrets, emulator data, or user data.
- If permitted by the receiving program, export issue descriptions, pull requests, reviews, and comments as supplemental machine-readable metadata.

## History policy

- Do not rewrite dates, squash authentic development, manufacture commits, or remove automated-agent attribution.
- Fix unclear historical behavior through new issues, ADRs, tests, and forward commits.
- Preserve merge commits, relevant branches, tags, and author identities.

## Acceptance criteria

- A clean-room reviewer can build, test, run, and package the project from documented commands.
- All significant contributors and bundled fixtures have a recorded rights/provenance basis.
- The release archive passes secret, size, integrity, and reproducibility checks.
- The first release includes test evidence, SBOM, license report, changelog, and known limitations.

## Acceptance
## Log
