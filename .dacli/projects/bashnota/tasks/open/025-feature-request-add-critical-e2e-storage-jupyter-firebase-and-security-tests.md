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
