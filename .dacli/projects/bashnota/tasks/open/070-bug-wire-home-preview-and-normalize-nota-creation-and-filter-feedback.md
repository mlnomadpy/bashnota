---
id: t-01M1CQJ22P81VX0DKZWAKHKK0N
kind: task
created: 2026-08-31T20:18:19Z
created_by: a-root
owner: a-root
github:
  issue: 70
  repo: mlnomadpy/bashnota
github_acceptance_import:
  issue: 70
  body_digest: sha256:0e4b85883d1effe8181624e1775de79f2f6fef54f5f0195c0524c378c5f18668
  actor: a-root
  imported_at: 2026-08-31T20:18:19Z
---
# Bug: wire Home preview and normalize nota creation and filter feedback
## Context
Adopted from GitHub issue #70.

## Browser observations

- Preview sets quickPreviewNota and showQuickPreview but no preview component is rendered.
- First-run home exposes competing Create a Nota and Create Nota actions.
- Different create buttons provide different navigation expectations.
- Search is reported as an active filter.
- Create, favorite, and clear-filter actions emit duplicate toasts.

Relevant areas: HomeNotaList.vue, NotaTable.vue, HomeHeader.vue, and nota action/store layers.

## Acceptance criteria

- Preview opens an accessible responsive dialog or Sheet with the nota title and content.
- One primary create action is emphasized per state.
- Every creation entry point follows the same navigation rule.
- Search and structured filters are reported separately.
- Each action has one toast owner and one announcement.
- Browser E2E covers empty, populated, filtered, and mobile states.

## Acceptance
- [ ] Preview opens an accessible responsive dialog or Sheet with the nota title and content.
- [ ] One primary create action is emphasized per state.
- [ ] Every creation entry point follows the same navigation rule.
- [ ] Search and structured filters are reported separately.
- [ ] Each action has one toast owner and one announcement.
- [ ] Browser E2E covers empty, populated, filtered, and mobile states.
## Log
