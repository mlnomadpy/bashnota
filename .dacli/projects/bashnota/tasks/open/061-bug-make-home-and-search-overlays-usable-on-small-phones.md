---
id: t-01M1CQJ1K6SS6H8F8ZWBKVCYRP
kind: task
created: 2026-08-31T20:18:18Z
created_by: a-root
owner: a-root
github:
  issue: 80
  repo: mlnomadpy/bashnota
github_acceptance_import:
  issue: 80
  body_digest: sha256:7409c1558d0c7c70d435deff263bd6264fc017cdd1ddfacb00122d81828d7281
  actor: a-root
  imported_at: 2026-08-31T20:18:18Z
---
# Bug: make Home and Search overlays usable on small phones
## Context
Adopted from GitHub issue #80.

## Confirmed browser findings

At 390x700, Search Notas exceeds the viewport horizontally: its description and quick-filter row are clipped, the table action column renders around x=549 outside a 390px viewport, and the visible Delete control cannot be clicked. At 320x568, the Newsletter dialog crops its icon/title and places its CTA, footer, and close control below the visible viewport without an in-dialog scrolling affordance.

## Source evidence

- Search dialog: src/features/nota/components/SearchModal.vue:220-344 combines max-height 80vh with a fixed 500px results area and a wide table.
- Newsletter: src/features/bashhub/components/NewsletterModal.vue:34-95 uses the base centered dialog without max-height or overflow handling.

## Acceptance criteria

- Dialog content is constrained to the visual viewport and scrolls internally.
- Search filters wrap or horizontally scroll intentionally.
- Nota results use a responsive card/list treatment or keep every action reachable without page overflow.
- Close and primary actions remain visible/reachable at 320x568 and 390x700.
- Add Playwright visual/interaction coverage at both viewports.

## Acceptance
- [ ] Dialog content is constrained to the visual viewport and scrolls internally.
- [ ] Search filters wrap or horizontally scroll intentionally.
- [ ] Nota results use a responsive card/list treatment or keep every action reachable without page overflow.
- [ ] Close and primary actions remain visible/reachable at 320x568 and 390x700.
- [ ] Add Playwright visual/interaction coverage at both viewports.
## Log
