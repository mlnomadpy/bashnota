---
id: t-01M1CQJ27XVXGNXMM2C687XV46
kind: task
created: 2026-08-31T20:18:19Z
created_by: a-root
owner: a-root
github:
  issue: 67
  repo: mlnomadpy/bashnota
github_acceptance_import:
  issue: 67
  body_digest: sha256:66f29dc1ab5f8b85b3a0982c329adcbfbe3e1a316d90fd12acb336004321b493
  actor: a-root
  imported_at: 2026-08-31T20:18:19Z
---
# Bug: make the Help dialog responsive on mobile
## Context
Adopted from GitHub issue #67.

## Browser reproduction

Open Help with F1 at 390 by 844.

## Observed

The desktop two-column navigation remains active. The left navigation consumes most of the dialog and the article is reduced to a narrow strip with word-by-word wrapping and horizontal scrolling.

## Expected

Help is readable and navigable without horizontal scrolling on mobile.

## Acceptance criteria

- Mobile uses a single content column.
- Topic navigation becomes a Sheet, Select, or collapsible index.
- Dialog content and footer remain independently usable with large text.
- Close control has a minimum 44 px touch target.
- Tests cover 320, 390, 768, and desktop widths.

## Acceptance
- [ ] Mobile uses a single content column.
- [ ] Topic navigation becomes a Sheet, Select, or collapsible index.
- [ ] Dialog content and footer remain independently usable with large text.
- [ ] Close control has a minimum 44 px touch target.
- [ ] Tests cover 320, 390, 768, and desktop widths.
## Log
