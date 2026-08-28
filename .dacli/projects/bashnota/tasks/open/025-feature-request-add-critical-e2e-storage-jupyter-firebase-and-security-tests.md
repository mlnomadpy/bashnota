---
id: t-01M0F8AY34CT0NBT7MHBHQ4B7W
kind: task
created: 2026-08-20T09:34:18Z
created_by: a-root
owner: a-root
github:
  issue: 8
  repo: mlnomadpy/bashnota
estimate: "{optimistic: 8, probable: 13, pessimistic: 21}"
---
# Feature request: add critical E2E, storage, Jupyter, Firebase, and security tests
## Context
Adopted from GitHub issue #8.

## Objective

Build an executable verification suite around the repository's highest-risk and highest-value workflows.

## Required suites

- Playwright E2E: create, edit, autosave, reopen, export, import, publish, view, and unpublish a nota.
- Shared storage contract tests for memory, IndexedDB, and filesystem backends.
- Migration tests for interruption, rollback, partial data, version upgrades, and corrupted files.
- Jupyter protocol tests using a controlled fake HTTP/WebSocket server.
- AI-provider contract tests with deterministic mock streaming and error responses.
- Firebase Rules emulator tests for all collections and cross-user access.
- Publishing API integration tests, including validation and ownership.
- Content-security regression tests for every rendering boundary.
- Large-document, many-block, and large-output performance tests.
- PWA install, offline load, cache upgrade, and stale-service-worker tests.

## Infrastructure changes

- Add reusable fixtures without customer or production data.
- Add deterministic clocks, IDs, and network mocks.
- Emit JUnit and coverage artifacts in CI.
- Establish an initial coverage gate focused on services, stores, migrations, and backend routes.
- Track flaky tests explicitly; do not silently retry unit tests until they pass.

## Acceptance criteria

- One command runs all fast tests locally.
- One documented command runs emulator and E2E suites.
- Critical services and stores reach at least 60% line/branch coverage initially.
- Every fixed production defect adds a regression test.
- CI reports test duration and detects unexpectedly skipped tests.

## Acceptance
## Log
- 2026-08-27T22:35:13Z claimed by a-supabase-implementer-y4p5v6
- 2026-08-27T22:50:54Z claimed by a-supabase-implementer-v14vjb
- 2026-08-27T23:08:18Z claimed by a-supabase-implementer-tccepf
- 2026-08-28T00:23:15Z claimed by a-bashnota-implementer-w151dr
- 2026-08-28T09:52:25Z claimed by a-bashnota-implementer-bd3nh3
- 2026-08-28T10:05:52Z a-root: Landing policy override: mode=pr base=master (event 01M13W84P1A61MEHBE5GQ7TK89)
- 2026-08-28T10:05:52Z a-root: Integrated via PR https://github.com/mlnomadpy/bashnota/pull/44 at merge commit 2771f4aeb36db46ad461f861b4d6b44dbc23b765 into master (generation 0) (event 01M13W8BGTYM32PKH935RCBX0S)
- 2026-08-28T10:33:52Z a-root: PR opened: https://github.com/mlnomadpy/bashnota/pull/46 (event 01M13XV0QVMCSPFNT71JN89QFP)
- 2026-08-28T10:33:52Z a-root: Landing policy override: mode=pr base=master (event 01M13Y69YWM2P7K75MS110MX94)
- 2026-08-28T11:44:37Z claimed by a-bashnota-implementer-99b8c4
- 2026-08-28T12:08:04Z claimed by a-bashnota-implementer-gbyrfw
- 2026-08-28T12:15:13Z a-root: PR opened: https://github.com/mlnomadpy/bashnota/pull/47 (event 01M143XATG43VM44TF00YN9E8F)
- 2026-08-28T12:15:13Z a-root: Landing policy override: mode=pr base=master (event 01M1445HRH6NT4WWZ3HB1CNKCS)
