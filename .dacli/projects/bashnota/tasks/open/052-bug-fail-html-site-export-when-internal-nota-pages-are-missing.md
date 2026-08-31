---
id: t-01M1CQJ12P19TQMAENDE6GADQ1
kind: task
created: 2026-08-31T20:18:18Z
created_by: a-root
owner: a-root
github:
  issue: 89
  repo: mlnomadpy/bashnota
github_acceptance_import:
  issue: 89
  body_digest: sha256:86d856fe35734b1e3b4bb4f8d91cd6fe1f5d7365e129a06f4b37d092f3abb99f
  actor: a-root
  imported_at: 2026-08-31T20:18:18Z
---
# Bug: fail HTML site export when internal nota pages are missing
## Context
Adopted from GitHub issue #89.

HTML export rewrites internal links before loading targets, then queueNotaIfNeeded catches read errors or accepts null and continues. The UI reports success even though the archive lacks the linked pages, producing broken pages/<id>.html links.

## Evidence

- Link rewrite and swallowed target-load failure: src/features/editor/services/exportService.ts:95-145.
- Success toast despite incomplete graph: src/features/editor/components/dialogs/ExportDialog.vue:419-456.

## Acceptance criteria

- Resolve and validate the entire internal-link graph before finalizing the archive.
- Missing/unreadable targets fail export or require an explicit continue-with-broken-links decision listing every target.
- Never show unconditional success for an incomplete archive.
- Add missing-target, unreadable-target, cycle, and complete-tree export tests.

## Acceptance
- [ ] Resolve and validate the entire internal-link graph before finalizing the archive.
- [ ] Missing/unreadable targets fail export or require an explicit continue-with-broken-links decision listing every target.
- [ ] Never show unconditional success for an incomplete archive.
- [ ] Add missing-target, unreadable-target, cycle, and complete-tree export tests.
## Log
