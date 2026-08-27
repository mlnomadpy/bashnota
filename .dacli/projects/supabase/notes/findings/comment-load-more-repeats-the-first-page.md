---
id: f-comment-load-more-repeats-the-first-page
kind: note
note_kind: finding
created: 2026-08-14T09:26:00Z
created_by: a-root
about: "[[t-01KZYG57FETV6T5AGJF939HCCF]]"
severity: moderate
---
# Comment load-more repeats the first page
CommentSection increments currentPage without passing nextCursor and appends the same first 20 comments. Preserve nextCursor through facade/UI and test ordered duplicate-free pagination.
