---
id: t-01M0D7BZ1NHDKSJ8VJYS9JTY5Y
kind: task
created: 2026-08-19T14:38:55Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 3, probable: 5, pessimistic: 8}"
github:
  issue: 23
  repo: mlnomadpy/bashnota
blocked_by: "[[bashnota/045]]"
---
# Stop preloading editor stacks on non-editor routes
## So that
home, login, registration, and public reading do not eagerly download editor, D3, KaTeX, or Vue Flow
## Acceptance
- [x] Editor-only dialogs and providers load only after entering an editor-capable route or invoking their feature
- [x] Built Home, Auth, and Public route preload graphs exclude editor, D3, KaTeX, and Vue Flow chunks while editor behavior remains available
- [x] CI enforces an initial-route asset graph budget in addition to the existing entry-file cap
- [x] Route smoke tests, full Vitest, typecheck, build, bundle budgets, and diff-check pass
## Log
- 2026-08-20T08:24:36Z claimed by a-root
- 2026-08-22T15:53:28Z a-verifier-kst9x4: verify-verdict: no-verdict — claude-ro (a-verifier-kst9x4) on claim: Task 018's route-gated editor-shell implementation preserves editor and PWA behavior while built non-editor routes exclude editor, D3, KaTeX, and Vue Flow from their initial graphs. — panelist reported nothing — counts as unconfirmed (event 01M0F5P21R166B9VM8BG7XMA7H)
- 2026-08-22T15:53:28Z a-verifier-0ejryy: verify-verdict: no-verdict — codex-ro (a-verifier-0ejryy) on claim: Task 018's route-gated editor-shell implementation preserves editor and PWA behavior while built non-editor routes exclude editor, D3, KaTeX, and Vue Flow from their initial graphs. — panelist reported nothing — counts as unconfirmed (event 01M0F5P22Z5D070ERZ8YPKJ0CX)
- 2026-08-26T22:24:35Z blocked: blocked_by [[bashnota/045]] Implementation and review are complete, but its PR must be refreshed with the deterministic Chrome gate before GitHub Quality and landing.
- 2026-08-27T00:23:41Z claimed by a-root
- 2026-08-27T01:03:51Z accepted by a-root
- 2026-08-27T01:03:51Z closed WITHOUT verification — no --verify command was given
- 2026-08-27T01:03:51Z deliverable: dacli/018-stop-preloading-editor-stacks-on-non-editor-routes is merged into master
- 2026-08-27T01:03:51Z completed by a-root
- 2026-08-27T01:04:13Z a-root: PR opened: https://github.com/mlnomadpy/bashnota/pull/26 (event 01M0Z744YDZJBA7JRACTM92H2J)
- 2026-08-27T01:04:13Z a-root: Landing policy override: mode=pr base=master (event 01M10BVNKSAVVHKTGN3TYGPY0P)
- 2026-08-27T01:04:13Z a-root: Integrated via PR https://github.com/mlnomadpy/bashnota/pull/26 at merge commit 984ab2fd279122b82c4895c6ce1cd86e13761bbc into master (event 01M10BVWKRQGEHCT2400FMMP51)
