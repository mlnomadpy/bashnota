---
id: t-01M0N6FG7J3V1814K0ZWM5R2SD
kind: task
created: 2026-08-22T16:57:17Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 2, probable: 4, pessimistic: 7}"
github:
  issue: 15
  repo: mlnomadpy/bashnota
blocked_by: "[[bashnota/041]]"
---
# Fix missing-nota loading and recovery states
## Acceptance
- [x] NotaPane distinguishes loading, not-found, and read-error states instead of rendering an endless spinner
- [x] Not-found and error states expose accessible Retry, Home, and stale-pane close actions without disturbing other open panes
- [x] Mounted tests cover missing IDs, adapter rejection, retry success, and preservation of other panes
- [x] Typecheck, focused tests, full Vitest, build, and diff-check pass
## Log
- 2026-08-26T22:25:07Z claimed by a-root
- 2026-08-26T22:46:46Z blocked: blocked_by [[bashnota/041]] Independent review passed, but the recorded shared-store landing decision requires task041 to land first; then refresh task039 from trunk and rerun gates.
- 2026-08-27T00:10:47Z claimed by a-root
- 2026-08-27T00:22:10Z accepted by a-root
- 2026-08-27T00:22:10Z closed WITHOUT verification — no --verify command was given
- 2026-08-27T00:22:10Z deliverable: dacli/039-fix-missing-nota-loading-and-recovery-states is merged into master
- 2026-08-27T00:22:10Z completed by a-root
- 2026-08-27T01:04:13Z a-root: PR opened: https://github.com/mlnomadpy/bashnota/pull/31 (event 01M108YJJ7XAT41PVZW3C4XMWV)
- 2026-08-27T01:04:13Z a-root: Landing policy override: mode=pr base=master (event 01M109FFV9KVV76C4GKVB4WA33)
- 2026-08-27T01:04:13Z a-root: Integrated via PR https://github.com/mlnomadpy/bashnota/pull/31 at merge commit 88da7da56fb185fb40635ab92f2da41ac581ee58 into master (event 01M109FPWZPYF823MP61R8PAZ7)
## Verification Evidence
{"command":"npm run test:unit -- --run src/features/nota/components/__tests__/NotaPane.recovery.test.ts \u0026\u0026 npm run type-check \u0026\u0026 npm run test:unit -- --run \u0026\u0026 npm run build \u0026\u0026 git diff --check","exit_code":0,"duration_ms":54415,"artifact_hash":"sha256:5ad3e3e05d569ba7e7eb7fd2006fdffc94c08b187ea5fbcea7b4ab73e1a3e0e4","verifier":"a-root","branch":"dacli/039-fix-missing-nota-loading-and-recovery-states","commit_sha":"91e23a61a7997b5b2243789604e82ea665ab3297"}
