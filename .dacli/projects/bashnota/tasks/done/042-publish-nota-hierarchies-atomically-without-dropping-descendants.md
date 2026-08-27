---
id: t-01M0N6FGNKSD2ESRHJ27A8670Y
kind: task
created: 2026-08-22T16:57:18Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 3, probable: 5, pessimistic: 8}"
github:
  issue: 18
  repo: mlnomadpy/bashnota
blocked_by: "[[bashnota/045]]"
---
# Publish nota hierarchies atomically without dropping descendants
## Acceptance
- [x] A first-time root publish with multilevel descendants creates every canonical publication and ordered edge or changes nothing
- [x] No child error is suppressed into a root-only success; partial failures are explicit and leave local publish state consistent
- [x] A publishable-key integration test exercises the production store orchestration, retry, concurrent publish, and image cleanup behavior
- [x] Clean Supabase reset, pgTAP, browser publishing integration, typecheck, full Vitest, build, and diff-check pass
## Log
- 2026-08-26T14:11:26Z claimed by a-root
- 2026-08-26T22:24:35Z blocked: blocked_by [[bashnota/045]] Implementation and review are complete, but GitHub landing is held until task045 restores an observable reliable Quality gate.
- 2026-08-27T00:23:41Z claimed by a-root
- 2026-08-27T00:49:09Z accepted by a-root
- 2026-08-27T00:49:09Z closed WITHOUT verification — no --verify command was given
- 2026-08-27T00:49:09Z deliverable: dacli/042-publish-nota-hierarchies-atomically-without-dropping-descendants is merged into master
- 2026-08-27T00:49:09Z completed by a-root
- 2026-08-27T01:04:13Z finding by a-verifier-nmy03s: verdict: refuted — partial in-memory child state silently drops persisted descendants (event 01M0Z8G5MWJYAT5SDS2GFWQAAW)
- 2026-08-27T01:04:13Z a-verifier-nmy03s: verify-verdict: refuted — codex-ro (a-verifier-nmy03s) on claim: Commit c70d4c8 atomically publishes a complete ordered nota hierarchy, surfaces child failures without partial publication or misleading local success, serializes same-root concurrency, and compensates failed image uploads. — partial in-memory child state silently drops persisted descendants (event 01M0Z8GB9WHDGX0DDPZM61398J)
- 2026-08-27T01:04:13Z a-verifier-vxakqf: verify-verdict: no-verdict — claude-ro (a-verifier-vxakqf) on claim: Commit c70d4c8 atomically publishes a complete ordered nota hierarchy, surfaces child failures without partial publication or misleading local success, serializes same-root concurrency, and compensates failed image uploads. — panelist reported nothing — counts as unconfirmed (event 01M0Z8GFDB9H097JNJRK1DH1ZJ)
- 2026-08-27T01:04:13Z finding by a-verifier-najx4b: verdict: refuted — lost-response reconciliation accepts stale author metadata as a successful commit (event 01M0ZA7N0EG25CJRDMR3SYN8G2)
- 2026-08-27T01:04:13Z a-verifier-najx4b: verify-verdict: refuted — codex-ro (a-verifier-najx4b) on claim: HEAD 91038c6 closes the independent review: atomic hierarchy publication preserves external parent ordering, discovers persisted siblings under partial hydration, rejects null content, and reconciles or explicitly retains images on ambiguous RPC completion. — lost-response reconciliation accepts stale author metadata as a successful commit (event 01M0ZA7YVDEXF5MTWE0PS77KTR)
- 2026-08-27T01:04:13Z a-verifier-3486ba: verify-verdict: no-verdict — claude-ro (a-verifier-3486ba) on claim: HEAD 91038c6 closes the independent review: atomic hierarchy publication preserves external parent ordering, discovers persisted siblings under partial hydration, rejects null content, and reconciles or explicitly retains images on ambiguous RPC completion. — panelist reported nothing — counts as unconfirmed (event 01M0ZA80KQ4GJGGA7AGMWE5SZF)
- 2026-08-27T01:04:13Z a-verifier-89vs5p: verify-verdict: no-verdict — codex-ro (a-verifier-89vs5p) on claim: Final HEAD a9175b1 requires exact content, hierarchy, authorName, and visibility metadata when reconciling ambiguous hierarchy publication, and all prior atomicity review findings remain closed. — panelist reported nothing — counts as unconfirmed (event 01M0ZAHTDDS93CG3JG3T2F01E7)
- 2026-08-27T01:04:13Z a-root: PR opened: https://github.com/mlnomadpy/bashnota/pull/34 (event 01M10AR9SXR4K8PG5ATP9KAWEP)
- 2026-08-27T01:04:13Z a-root: Landing policy override: mode=pr base=master (event 01M10B1PVMT9FG8HCVKENV88SY)
- 2026-08-27T01:04:13Z a-root: Integrated via PR https://github.com/mlnomadpy/bashnota/pull/34 at merge commit cdcef04ada94e390947ff6c21deb1a174453c980 into master (event 01M10B1XZ6CKCFTMGQYV45SB9Q)
## Verification Evidence
{"command":"npm run test:supabase","exit_code":0,"duration_ms":44369,"artifact_hash":"sha256:9d46f9bf59def906c9f9b10e68eb7c0f52cd8f67e114a8402ec4242cb868987f","verifier":"a-root","branch":"dacli/042-publish-nota-hierarchies-atomically-without-dropping-descendants","commit_sha":"c70d4c814741954f660429c6dae00d8c2bbd10a2"}
{"command":"npx vitest run src/features/nota/stores/__tests__/notaPublishing.test.ts","exit_code":0,"duration_ms":2561,"artifact_hash":"sha256:6568c119b55687110de55dcd56dfc8717bb48cf16a21712cbf570e2a028ea579","verifier":"a-root","branch":"dacli/042-publish-nota-hierarchies-atomically-without-dropping-descendants","commit_sha":"c70d4c814741954f660429c6dae00d8c2bbd10a2"}
{"command":"npm run test:supabase:publishing","exit_code":0,"duration_ms":2460,"artifact_hash":"sha256:f164e09ebd32703da5b17612c49412ee6e99403be3fa1027cc1746a616a6a469","verifier":"a-root","branch":"dacli/042-publish-nota-hierarchies-atomically-without-dropping-descendants","commit_sha":"c70d4c814741954f660429c6dae00d8c2bbd10a2"}
{"command":"npm run type-check \u0026\u0026 npm run test:unit -- --run \u0026\u0026 npm run build \u0026\u0026 git diff HEAD^ --check","exit_code":0,"duration_ms":69600,"artifact_hash":"sha256:4dacc68f44b1b0976646efc7600c5f310db6ef7596857c3d1ae5e6421f44fb63","verifier":"a-root","branch":"dacli/042-publish-nota-hierarchies-atomically-without-dropping-descendants","commit_sha":"c70d4c814741954f660429c6dae00d8c2bbd10a2"}
