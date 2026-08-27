---
id: t-01M10BZYVVK03HWKPG17RXAVSV
kind: task
created: 2026-08-27T01:05:18Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 3, probable: 5, pessimistic: 8}"
parent: "[[t-01M0F8AY2FNV61M44CWRKB91KX]]"
github:
  issue: 37
  repo: mlnomadpy/bashnota
---
# Redact credentials and harden AI and Jupyter trust boundaries
## So that
provider and notebook credentials cannot leak through persistence, URLs, logs, or unconfirmed remote execution
## Acceptance
- [x] Central redaction removes provider keys, bearer tokens, Firebase tokens, and Jupyter tokens from logs, errors, URLs, and test artifacts
- [x] AI keys default to memory or session scope and protocol clients use authorization headers whenever supported
- [x] Non-local Jupyter connections require explicit confirmation plus HTTPS or WSS, while local execution authority is stated before code runs
- [x] Deterministic tests cover persistence boundaries, redaction variants, URL/query leakage, transport policy, confirmation, and local-versus-remote execution
## Log
- 2026-08-27T02:12:15Z claimed by a-security-fixer-rr8a25
- 2026-08-27T09:48:03Z claimed by a-security-fixer-sk5tgf
- 2026-08-27T10:06:14Z claimed by a-security-fixer-frh2e6
- 2026-08-27T10:09:06Z claimed by a-security-fixer-pz04by
- 2026-08-27T10:32:22Z claimed by a-security-fixer-n8xfga
- 2026-08-27T10:39:05Z claimed by a-security-fixer-pn48g3
- 2026-08-27T10:43:12Z claimed by a-security-fixer-nvhwty
- 2026-08-27T10:52:14Z a-verifier-dr33cj: verify-verdict: no-verdict — claude-ro (a-verifier-dr33cj) on claim: Token-authenticated Jupyter execution now bootstraps cookie-backed WebSockets on both clients — panelist reported nothing — counts as unconfirmed (event 01M11DGE6JM78G38VFVE8PE4B8)
- 2026-08-27T10:52:14Z a-verifier-qyerhe: verify-verdict: no-verdict — claude-ro2 (a-verifier-qyerhe) on claim: Token-authenticated Jupyter execution now bootstraps cookie-backed WebSockets on both clients — panelist reported nothing — counts as unconfirmed (event 01M11DGEM67726SY1EHXXD5JDN)
- 2026-08-27T10:52:14Z a-verifier-1bz1v7: verify-verdict: no-verdict — codex-ro (a-verifier-1bz1v7) on claim: Token-authenticated Jupyter execution now bootstraps cookie-backed WebSockets on both clients — panelist reported nothing — counts as unconfirmed (event 01M11DGVBQNMA4MCCWHCJ807J0)
- 2026-08-27T13:13:28Z accepted by a-root (applied 1 proposal(s))
- 2026-08-27T13:13:28Z verified by `npm run test:jupyter-security` (exit 0) in branch master at b784b16 — proves that tree builds, not that the work is in trunk
- 2026-08-27T13:13:28Z deliverable: dacli/048-redact-credentials-and-harden-ai-and-jupyter-trust-boundaries is merged into master
- 2026-08-27T13:13:28Z completed by a-root
- 2026-08-27T22:28:19Z a-root: PR opened: https://github.com/mlnomadpy/bashnota/pull/41 (event 01M11HC423QY6WSKYCDBZ7MS3Y)
- 2026-08-27T22:28:19Z a-root: Landing policy override: mode=pr base=master (event 01M11N9V4F21Y4AN2XWHGQ7AQZ)
- 2026-08-27T22:28:19Z a-root: Integrated via PR https://github.com/mlnomadpy/bashnota/pull/41 at merge commit b784b16ffce33f4c733cc90b4c9089332cd62fb6 into master (event 01M11NA35N82FQM4F9RWY2ES99)
- 2026-08-27T22:28:19Z a-root: Landing policy override: mode=pr base=master (event 01M11NB4TCSS75B8KVJR7HQ805)
## Verification Evidence
{"command":"npm run test:jupyter-security","exit_code":0,"duration_ms":2311,"artifact_hash":"sha256:e0936f6082f02998a356f5e0c3793be178c866eb02862ab9d29c18c8af1c85cc","verifier":"a-root","branch":"master","commit_sha":"b784b16ffce33f4c733cc90b4c9089332cd62fb6"}
