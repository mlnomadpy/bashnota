---
id: t-01M1CQJ1VYF125YDQ0MTKJ7EVJ
kind: task
created: 2026-08-31T20:18:19Z
created_by: a-root
owner: a-root
github:
  issue: 74
  repo: mlnomadpy/bashnota
github_acceptance_import:
  issue: 74
  body_digest: sha256:5d408e00575e834bcd460f11361aaf474eac30e7a31daed6091de8c59baec982
  actor: a-root
  imported_at: 2026-08-31T20:18:19Z
---
# Bug: improve mobile Profile layout and provide consistent app navigation
## Context
Adopted from GitHub issue #74.

## Browser observations at 390 px

- Verified status competes with and overflows the email field.
- User-tag input, domain suffix, and availability button are crowded into one row.
- Profile is a standalone page with no visible Home or Back action.
- A small unexplained floating icon remains along the left edge.

## Expected

Profile fields reflow cleanly and the user can return to their notes without relying on browser history.

## Acceptance criteria

- Email verification status occupies its own responsive row or InputGroup slot.
- Tag field and availability action stack at narrow widths.
- Header includes Home or Back navigation consistent with Settings.
- All icon controls are named and use shadcn Tooltip.
- Visual tests cover long email addresses, tags, error text, and 200 percent zoom.

## Acceptance
- [ ] Email verification status occupies its own responsive row or InputGroup slot.
- [ ] Tag field and availability action stack at narrow widths.
- [ ] Header includes Home or Back navigation consistent with Settings.
- [ ] All icon controls are named and use shadcn Tooltip.
- [ ] Visual tests cover long email addresses, tags, error text, and 200 percent zoom.
## Log
