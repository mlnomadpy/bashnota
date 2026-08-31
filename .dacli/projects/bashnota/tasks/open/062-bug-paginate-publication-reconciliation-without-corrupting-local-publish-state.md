---
id: t-01M1CQJ1N2XNQTBSG8QMAYTETK
kind: task
created: 2026-08-31T20:18:18Z
created_by: a-root
owner: a-root
github:
  issue: 79
  repo: mlnomadpy/bashnota
github_acceptance_import:
  issue: 79
  body_digest: sha256:be3f81e69aea6fb4756b39aa0d9488dca98c017ebe004b8250fa2cdb572f6feb
  actor: a-root
  imported_at: 2026-08-31T20:18:18Z
---
# Bug: paginate publication reconciliation without corrupting local publish state
## Context
Adopted from GitHub issue #79.

## Severity: P1

loadPublishedNotas requests one owner page of 100, ignores nextCursor, then marks every local nota absent from that first page as unpublished and persists the false marker. Author portfolios also present the first 100 as complete totals/statistics/CSV.

## Evidence

- src/features/nota/stores/nota.ts:1768-1794 performs destructive reconciliation from one page.
- src/features/nota/stores/nota.ts:1755-1761 hard-caps profile loading at 100.
- src/services/cloud/supabasePublishing.ts:54-65 exposes nextCursor but callers ignore it.
- src/features/editor/components/dialogs/PublishNotaModal.vue:111-129 triggers reconciliation when Share/Publish opens.

## Acceptance criteria

- Reconcile only after every cursor page is loaded, or use a server-side owner-state query.
- A partial/failed listing must never mark local notas unpublished.
- Portfolios paginate and label totals/statistics accurately.
- Add >100-publication integration and browser fixtures.

## Acceptance
- [ ] Reconcile only after every cursor page is loaded, or use a server-side owner-state query.
- [ ] A partial/failed listing must never mark local notas unpublished.
- [ ] Portfolios paginate and label totals/statistics accurately.
- [ ] Add >100-publication integration and browser fixtures.
## Log
