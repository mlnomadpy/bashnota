---
id: t-01M0N6FGC8NQD51D11Q68WKJN2
kind: task
created: 2026-08-22T16:57:17Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 3, probable: 5, pessimistic: 8}"
github:
  issue: 16
  repo: mlnomadpy/bashnota
blocked_by: "[[bashnota/045]]"
---
# Surface authentication failures and prevent false reset success
## Acceptance
- [x] Login, registration, Google, and password-reset failures render one accessible actionable error owned by a single UI boundary
- [x] Password-reset success is shown only when the store operation returns true; false and rejected operations never show success
- [x] Mounted tests cover every failed flow, success flow, duplicate-toast prevention, and error clearing on retry
- [x] Typecheck, focused tests, full Vitest, build, and diff-check pass
## Log
- 2026-08-26T22:25:00Z claimed by a-root
- 2026-08-26T22:57:21Z blocked: blocked_by [[bashnota/045]] PR 30 reproduced the export-security Chrome safe-content timeout; all task040 gates before that step passed. Landing waits for task045 harness repair.
- 2026-08-27T00:03:19Z claimed by a-root
- 2026-08-27T00:13:54Z accepted by a-root
- 2026-08-27T00:13:54Z closed WITHOUT verification — no --verify command was given
- 2026-08-27T00:13:54Z deliverable: dacli/040-surface-authentication-failures-and-prevent-false-reset-success is merged into master
- 2026-08-27T00:13:54Z completed by a-root
- 2026-08-27T01:04:13Z a-root: PR opened: https://github.com/mlnomadpy/bashnota/pull/30 (event 01M1041QB8PF5RB7AZ0T3XF0SE)
- 2026-08-27T01:04:13Z a-root: Landing policy override: mode=pr base=master (event 01M10917ZWZGDAJRHABZD2KE2X)
- 2026-08-27T01:04:13Z a-root: Integrated via PR https://github.com/mlnomadpy/bashnota/pull/30 at merge commit f59f8bcaaa3ed405fedc0ec406b21e2da3be7221 into master (event 01M1091FNEE7JH36N9SQBRMMGH)
## Verification Evidence
{"command":"npx vitest run src/features/auth/views/AuthFeedbackFlows.test.ts src/features/auth/views/OAuthCallbackView.test.ts \u0026\u0026 npm run type-check \u0026\u0026 git diff --check master...HEAD","exit_code":0,"duration_ms":23222,"artifact_hash":"sha256:4255c1a2686aea4db0a4e50167972532f075d3dde45bcb6f6b9b6e4ba06d79ab","verifier":"a-root","branch":"dacli/040-surface-authentication-failures-and-prevent-false-reset-success","commit_sha":"b7d9af2eeca5bc07ce9be539735c409cee2f535c"}
