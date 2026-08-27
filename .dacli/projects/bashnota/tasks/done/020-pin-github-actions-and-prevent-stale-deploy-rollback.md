---
id: t-01M0D7FF5ZSF5VKQ7EECNAT7B9
kind: task
created: 2026-08-19T14:40:49Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 2, probable: 3, pessimistic: 5}"
github:
  issue: 24
  repo: mlnomadpy/bashnota
---
# Pin GitHub Actions and prevent stale deploy rollback
## So that
deployment executes reviewed immutable automation and only the newest tested master commit can ship
## Acceptance
- [x] Every GitHub Action is pinned to a reviewed full commit SHA
- [x] Immediately before deployment, workflow_run.head_sha must equal the current refs/heads/master SHA
- [x] Stable concurrency cancels superseded deploy runs and permissions use the least privilege supported by GitHub Pages deployment
- [x] Structural tests reject mutable action tags, stale successful runs, missing provenance predicates, and broadened permissions
- [x] Workflow tests, backend-purity, typecheck, full tests, build, and diff-check pass
## Log
- 2026-08-20T08:54:44Z claimed by a-root
- 2026-08-22T15:53:28Z a-verifier-2c0xkv: verify-verdict: no-verdict — claude-ro (a-verifier-2c0xkv) on claim: .github/workflows and deploy structural tests at commit 39b3fee — panelist reported nothing — counts as unconfirmed (event 01M0F6CKM0DJTHT8N99Y0YFPX1)
- 2026-08-22T15:53:28Z a-verifier-0269nf: verify-verdict: no-verdict — codex-ro (a-verifier-0269nf) on claim: .github/workflows and deploy structural tests at commit 39b3fee — panelist reported nothing — counts as unconfirmed (event 01M0F6CKNGEDR5741ZY1FJ7KKK)
- 2026-08-22T15:53:28Z a-verifier-raz46c: verify-verdict: no-verdict — claude-rw (a-verifier-raz46c) on claim: Commit 39b3fee satisfies all five task020 acceptance criteria without permitting stale or untrusted deployment — panelist reported nothing — counts as unconfirmed (event 01M0F6D8D3282X21SNBRF77BYX)
- 2026-08-22T15:53:28Z a-verifier-8w4bkg: verify-verdict: no-verdict — codex-rw (a-verifier-8w4bkg) on claim: Commit 39b3fee satisfies all five task020 acceptance criteria without permitting stale or untrusted deployment — panelist reported nothing — counts as unconfirmed (event 01M0F6D8E8ZBT759HDWZJ9RNM8)
- 2026-08-22T15:53:28Z a-verifier-58pkr9: verify-verdict: no-verdict — claude-ro (a-verifier-58pkr9) on claim: Commit 39b3fee satisfies all five task020 acceptance criteria without permitting stale or untrusted deployment — panelist reported nothing — counts as unconfirmed (event 01M0F6FH3H7VK73VGPABV7PV0S)
- 2026-08-26T14:28:48Z accepted by a-root
- 2026-08-26T14:28:48Z verified by `npm run test:deploy-workflow && git merge-base --is-ancestor a40aad6f0b31c5cedb1542b97b7a1a7955446f30 HEAD && git diff --check` (exit 0) in branch master at 91e23a6 — proves that tree builds, not that the work is in trunk
- 2026-08-26T14:28:48Z deliverable: dacli/020-pin-github-actions-and-prevent-stale-deploy-rollback is merged into master
- 2026-08-26T14:28:48Z completed by a-root
- 2026-08-27T01:04:13Z a-root: PR opened: https://github.com/mlnomadpy/bashnota/pull/25 (event 01M0Z71FMDHMBRQ00T219TEAR1)
- 2026-08-27T01:04:13Z a-root: Landing policy override: mode=pr base=master (event 01M0Z7H8XWZPRQX7A712ZK1241)
- 2026-08-27T01:04:13Z a-root: Integrated via PR https://github.com/mlnomadpy/bashnota/pull/25 at merge commit 91e23a61a7997b5b2243789604e82ea665ab3297 into master (event 01M0Z7HG63JKQFGZ7Y1RDFBXRR)
## Verification Evidence
{"command":"cd /Users/tahabsn/Documents/GitHub/bashnota/.dacli/worktrees/bashnota-020-pin-github-actions-and-prevent-stale-deploy-rollback \u0026\u0026 npm run test:deploy-workflow","exit_code":0,"duration_ms":156,"artifact_hash":"sha256:4707ddae041ac31db4bfd97cb872ba7245a287bb88eaf10bdfd3d2095aafd884","verifier":"a-root","branch":"master","commit_sha":"debe09fdbb311ea26a79debe3829d0304e9c4dc8"}
{"command":"cd /Users/tahabsn/Documents/GitHub/bashnota/.dacli/worktrees/bashnota-020-pin-github-actions-and-prevent-stale-deploy-rollback \u0026\u0026 node scripts/refuse-stale-deploy.self-test.mjs","exit_code":0,"duration_ms":33,"artifact_hash":"sha256:d254429b6b7abff24f07015a2346308768f737e944f7fe62d05c06085af6fa0e","verifier":"a-root","branch":"master","commit_sha":"debe09fdbb311ea26a79debe3829d0304e9c4dc8"}
{"command":"cd /Users/tahabsn/Documents/GitHub/bashnota/.dacli/worktrees/bashnota-020-pin-github-actions-and-prevent-stale-deploy-rollback \u0026\u0026 node scripts/deploy-workflow.self-test.mjs","exit_code":0,"duration_ms":42,"artifact_hash":"sha256:d0b35a1c503b6dfcd0d36de6ed96275bcb9046a7fbe1e1ae432d2941a82999ae","verifier":"a-root","branch":"master","commit_sha":"debe09fdbb311ea26a79debe3829d0304e9c4dc8"}
{"command":"cd /Users/tahabsn/Documents/GitHub/bashnota/.dacli/worktrees/bashnota-020-pin-github-actions-and-prevent-stale-deploy-rollback \u0026\u0026 npm run test:deploy-workflow","exit_code":0,"duration_ms":139,"artifact_hash":"sha256:4707ddae041ac31db4bfd97cb872ba7245a287bb88eaf10bdfd3d2095aafd884","verifier":"a-root","branch":"master","commit_sha":"debe09fdbb311ea26a79debe3829d0304e9c4dc8"}
{"command":"cd /Users/tahabsn/Documents/GitHub/bashnota/.dacli/worktrees/bashnota-020-pin-github-actions-and-prevent-stale-deploy-rollback \u0026\u0026 npm run check:backend-purity \u0026\u0026 npm run check:repository-hygiene \u0026\u0026 npm run type-check \u0026\u0026 npx vitest run \u0026\u0026 npm run build \u0026\u0026 git diff --check debe09f...HEAD","exit_code":0,"duration_ms":81243,"artifact_hash":"sha256:71964a5375d78ab489f6901903a2b34aa47eb73c05df61694e7bf8db8d040bf8","verifier":"a-root","branch":"master","commit_sha":"debe09fdbb311ea26a79debe3829d0304e9c4dc8"}
{"command":"cd /Users/tahabsn/Documents/GitHub/bashnota/.dacli/worktrees/bashnota-020-pin-github-actions-and-prevent-stale-deploy-rollback \u0026\u0026 npm run build","exit_code":0,"duration_ms":27467,"artifact_hash":"sha256:08ad0ef48bba5783ce11ea9929fb85233862783974d6c74e4f55e09d2651c233","verifier":"a-root","branch":"master","commit_sha":"debe09fdbb311ea26a79debe3829d0304e9c4dc8"}
{"command":"npm run build","exit_code":0,"duration_ms":24512,"artifact_hash":"sha256:8fe895b35718e079b8a3f026e716d3bd0cddf55182355a9df187f67b4541dc2a","verifier":"a-root","branch":"dacli/020-pin-github-actions-and-prevent-stale-deploy-rollback","commit_sha":"a40aad6f0b31c5cedb1542b97b7a1a7955446f30"}
{"command":"npm run test:deploy-workflow \u0026\u0026 git merge-base --is-ancestor a40aad6f0b31c5cedb1542b97b7a1a7955446f30 HEAD \u0026\u0026 git diff --check","exit_code":0,"duration_ms":268,"artifact_hash":"sha256:4707ddae041ac31db4bfd97cb872ba7245a287bb88eaf10bdfd3d2095aafd884","verifier":"a-root","branch":"master","commit_sha":"91e23a61a7997b5b2243789604e82ea665ab3297"}
