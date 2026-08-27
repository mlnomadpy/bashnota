---
id: t-01M0N6FGZ1WFJ4X7JD8RNBSSB7
kind: task
created: 2026-08-22T16:57:18Z
created_by: a-root
owner: a-root
priority: should
estimate: "{optimistic: 1, probable: 2, pessimistic: 3}"
github:
  issue: 20
  repo: mlnomadpy/bashnota
blocked_by: "[[bashnota/040]]"
---
# Label password visibility controls accessibly
## Acceptance
- [x] Login and registration password reveal controls expose an accessible name, keyboard focus, and current pressed or visibility state
- [x] Mounted accessibility tests cover password and confirmation controls in hidden and visible states
- [x] Typecheck, focused tests, build, and diff-check pass
## Log
- 2026-08-26T22:47:06Z claimed by a-root
- 2026-08-26T22:56:11Z blocked: blocked_by [[bashnota/040]] Independent review passed, but shared Login/Register views require task040 to land first; then refresh task044 from trunk and rerun gates.
- 2026-08-27T00:14:31Z claimed by a-root
- 2026-08-27T00:23:28Z accepted by a-root
- 2026-08-27T00:23:28Z closed WITHOUT verification — no --verify command was given
- 2026-08-27T00:23:28Z deliverable: dacli/044-label-password-visibility-controls-accessibly is merged into master
- 2026-08-27T00:23:28Z completed by a-root
- 2026-08-27T01:04:13Z a-root: PR opened: https://github.com/mlnomadpy/bashnota/pull/32 (event 01M1098V20ZJ11CKC2TDXAA3NM)
- 2026-08-27T01:04:13Z a-root: Landing policy override: mode=pr base=master (event 01M109HJY8GKCKTTHY4FW19PEN)
- 2026-08-27T01:04:13Z a-root: Integrated via PR https://github.com/mlnomadpy/bashnota/pull/32 at merge commit caf06ae3e82729669a8ad9f5c567f6711a7890a5 into master (event 01M109HVCYWD7C9W1NC6SC4QSH)
## Verification Evidence
{"command":"npm run test:unit -- run src/features/auth/views/PasswordVisibilityControls.test.ts","exit_code":0,"duration_ms":1400,"artifact_hash":"sha256:33bf6c1d406acb635ca5a8c81fdab289bd9cf7076b9d3c2843f84f75a153dbb3","verifier":"a-root","branch":"dacli/044-label-password-visibility-controls-accessibly","commit_sha":"91e23a61a7997b5b2243789604e82ea665ab3297"}
{"command":"npm run test:unit -- run src/features/auth/views/PasswordVisibilityControls.test.ts","exit_code":0,"duration_ms":1409,"artifact_hash":"sha256:9d82bca26e8b5ce0be693c7826acdee81458a07fd981d83359977e11b230668b","verifier":"a-root","branch":"dacli/044-label-password-visibility-controls-accessibly","commit_sha":"91e23a61a7997b5b2243789604e82ea665ab3297"}
{"command":"npm run type-check \u0026\u0026 npm run build \u0026\u0026 git diff --check","exit_code":0,"duration_ms":37272,"artifact_hash":"sha256:c3cc92c50f5b2b7ed7912ba4926a88abc30c9ca78bd816c97668e11dc8c8d64a","verifier":"a-root","branch":"dacli/044-label-password-visibility-controls-accessibly","commit_sha":"91e23a61a7997b5b2243789604e82ea665ab3297"}
{"command":"npm run build","exit_code":0,"duration_ms":18649,"artifact_hash":"sha256:66b1ca635d221e57044fef87cbf24a78193a70e7fa2eb95111567274f5082d45","verifier":"a-root","branch":"dacli/044-label-password-visibility-controls-accessibly","commit_sha":"91e23a61a7997b5b2243789604e82ea665ab3297"}
