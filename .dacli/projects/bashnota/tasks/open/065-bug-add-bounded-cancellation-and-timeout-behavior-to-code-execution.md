---
id: t-01M1CQJ1T8DVCC44GS393B5MGT
kind: task
created: 2026-08-31T20:18:19Z
created_by: a-root
owner: a-root
github:
  issue: 75
  repo: mlnomadpy/bashnota
github_acceptance_import:
  issue: 75
  body_digest: sha256:3b87be57afddd07c988527b2f9255f8ec656ca7708e82dae61de9b8c49bd1727
  actor: a-root
  imported_at: 2026-08-31T20:18:19Z
---
# Bug: add bounded cancellation and timeout behavior to code execution
## Context
Adopted from GitHub issue #75.

## Observed

The shared-session CodeExecutionService waits for a Jupyter kernel to return idle without an execution timeout. A kernel that never reaches idle can leave the application waiting forever.

Relevant code: src/services/codeExecutionService.ts execution loop.

## Expected

Every execution has a bounded lifecycle, visible elapsed state, user cancellation, and a recoverable timeout outcome.

## Acceptance criteria

- Configurable execution timeout with a safe default.
- Cancel and interrupt actions are always available while running.
- Timeout cleans listeners and does not poison later executions.
- UI distinguishes queued, running, interrupting, timed out, and failed.
- Fake Jupyter E2E covers never-idle, disconnect, reconnect, interrupt, and late messages.

## Acceptance
- [ ] Configurable execution timeout with a safe default.
- [ ] Cancel and interrupt actions are always available while running.
- [ ] Timeout cleans listeners and does not poison later executions.
- [ ] UI distinguishes queued, running, interrupting, timed out, and failed.
- [ ] Fake Jupyter E2E covers never-idle, disconnect, reconnect, interrupt, and late messages.
## Log
