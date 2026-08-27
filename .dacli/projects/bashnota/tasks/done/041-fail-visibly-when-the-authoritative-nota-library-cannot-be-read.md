---
id: t-01M0N6FGGYVRA6XMYQ8B9M0D3X
kind: task
created: 2026-08-22T16:57:18Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 2, probable: 4, pessimistic: 7}"
github:
  issue: 17
  repo: mlnomadpy/bashnota
blocked_by: "[[bashnota/045]]"
---
# Fail visibly when the authoritative nota library cannot be read
## Acceptance
- [x] loadNotas returns a typed failure or throws while retaining the last successfully loaded items
- [x] HomeView presents an accessible error and explicit retry, never a false empty-library success state
- [x] Tests cover Dexie and filesystem-adapter failures, retry success, refresh failure, and preservation of prior notas
- [x] Typecheck, focused tests, full Vitest, build, and diff-check pass
## Log
- 2026-08-26T22:25:15Z claimed by a-root
- 2026-08-26T22:57:21Z blocked: blocked_by [[bashnota/045]] PR 29 reproduced the export-security Chrome safe-content timeout; all task041 gates before that step passed. Landing waits for task045 harness repair.
- 2026-08-27T00:03:19Z claimed by a-root
- 2026-08-27T00:08:47Z accepted by a-root
- 2026-08-27T00:08:47Z closed WITHOUT verification — no --verify command was given
- 2026-08-27T00:08:47Z deliverable: dacli/041-fail-visibly-when-the-authoritative-nota-library-cannot-be-read is merged into master
- 2026-08-27T00:08:47Z completed by a-root
- 2026-08-27T01:04:13Z a-root: PR opened: https://github.com/mlnomadpy/bashnota/pull/29 (event 01M104133N5X3XCVVSW2R7Z05D)
- 2026-08-27T01:04:13Z a-root: Landing policy override: mode=pr base=master (event 01M108QQNA00CPDC5B6ZMNS6VT)
- 2026-08-27T01:04:13Z a-root: Integrated via PR https://github.com/mlnomadpy/bashnota/pull/29 at merge commit fda40ec73ed633b22be4cea505710d80f476774c into master (event 01M108QYQKG62G9VF7HN8ADVDP)
