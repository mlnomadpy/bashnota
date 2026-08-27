---
id: t-01M0F91R69D7KZMTKR3BRJYW3J
kind: task
created: 2026-08-20T09:46:46Z
created_by: a-root
owner: a-root
github:
  issue: 13
  repo: mlnomadpy/bashnota
estimate: "{optimistic: 1, probable: 2, pessimistic: 3}"
---
# Harden environment-file ignore rules and repository secret hygiene
## Context
Adopted from GitHub issue #13.

## Outcome\nPrevent local environment files, provider credentials, and generated backend state from being committed or published.\n\n## Evidence\n- Only `.env.example` is currently tracked and it contains public/local placeholder configuration.\n- No real environment or credential files are currently untracked.\n- The current `.gitignore` does not cover `.env.production`, `.env.development`, `.env.test`, `.env.staging`, `.envrc`, or `functions/.runtimeconfig.json`.\n- Current backend-purity checks pass, but they do not enforce the complete ignore contract.\n\n## Acceptance criteria\n- [ ] Ignore every dotenv variant at any depth while explicitly retaining example templates.\n- [ ] Ignore Firebase/Supabase local state and common private-key/service-account formats without hiding source configuration templates.\n- [ ] Add a deterministic repository-hygiene check that rejects tracked sensitive filenames and secret-named client variables.\n- [ ] Wire the check into Quality CI and include mutation/self-tests for the dangerous filename variants.\n- [ ] Typecheck, focused tests, full Vitest, build, backend purity, and diff-check pass.\n\n## Safety constraints\nDo not print or publish secret values. Report only paths, variable names, match classes, and counts. Do not rewrite Git history unless a confirmed credential is found and the owner separately authorizes rotation/history cleanup.

## Acceptance
- [x] Ignore every dotenv variant at any depth while explicitly retaining example templates
- [x] Ignore Firebase/Supabase local state and common private-key/service-account formats without hiding source configuration templates
- [x] Add a deterministic repository-hygiene check that rejects tracked sensitive filenames and secret-named client variables
- [x] Wire the check into Quality CI and include mutation/self-tests for the dangerous filename variants
- [x] Typecheck, focused tests, full Vitest, build, backend purity, and diff-check pass
## Log
- 2026-08-20T09:47:03Z claimed by a-root
- 2026-08-22T15:53:28Z a-root: PR opened: https://github.com/mlnomadpy/bashnota/pull/14 (event 01M0N1PJAXRN3EVRJ79QTXRQGB)
- 2026-08-26T12:38:57Z accepted by a-root
- 2026-08-26T12:38:57Z verified by `npm run check:repository-hygiene && npm run check:backend-purity && npm run type-check && npm run test:unit -- --run && npm run build-only && git diff --check` (exit 0) in branch master at 53e6a58 — proves that tree builds, not that the work is in trunk
- 2026-08-26T12:38:57Z deliverable: dacli/033-harden-environment-file-ignore-rules-and-repository-secret-hygiene is merged into master
- 2026-08-26T12:38:57Z completed by a-root
## Verification Evidence
{"command":"npm run check:repository-hygiene \u0026\u0026 npm run check:backend-purity \u0026\u0026 npm run type-check \u0026\u0026 npm run test:unit -- --run \u0026\u0026 npm run build-only \u0026\u0026 git diff --check","exit_code":0,"duration_ms":40210,"artifact_hash":"sha256:97f25112e54a855ae561ad402e604e7c8c05ced70195abb3ad36bc8638c674b0","verifier":"a-root","branch":"master","commit_sha":"53e6a583d86addc02adfe05dbec86ab9474317ce"}
