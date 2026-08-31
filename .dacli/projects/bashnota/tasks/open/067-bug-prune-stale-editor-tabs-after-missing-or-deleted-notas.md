---
id: t-01M1CQJ1XMBHB6BD5CS0SAK6XG
kind: task
created: 2026-08-31T20:18:19Z
created_by: a-root
owner: a-root
github:
  issue: 73
  repo: mlnomadpy/bashnota
github_acceptance_import:
  issue: 73
  body_digest: sha256:8be2123f98de8bf9e78c00214c098aa0c8ada1bd5d6df2258cd17be0c1c18a26
  actor: a-root
  imported_at: 2026-08-31T20:18:19Z
---
# Bug: prune stale editor tabs after missing or deleted notas
## Context
Adopted from GitHub issue #73.

## Browser reproduction

1. Navigate to a nonexistent nota or delete an open nota.
2. Return home, authenticate, or reload.
3. Open another nota.

## Observed

Multiple Untitled tabs remain in the editor shell and persist across navigation/reload even though their notas do not exist.

## Expected

Missing and deleted notas are removed from restored tab state, while valid unsaved recovery state is handled explicitly.

## Acceptance criteria

- Tab restoration validates every nota ID against the active storage authority.
- Missing/deleted entries are pruned or shown once as a recoverable stale tab.
- Close stale tab updates persisted workspace state.
- Authentication/storage-mode changes cannot duplicate tabs.
- Regression tests cover missing deep links, deletion, reload, and backend switching.

## Acceptance
- [ ] Tab restoration validates every nota ID against the active storage authority.
- [ ] Missing/deleted entries are pruned or shown once as a recoverable stale tab.
- [ ] Close stale tab updates persisted workspace state.
- [ ] Authentication/storage-mode changes cannot duplicate tabs.
- [ ] Regression tests cover missing deep links, deletion, reload, and backend switching.
## Log
