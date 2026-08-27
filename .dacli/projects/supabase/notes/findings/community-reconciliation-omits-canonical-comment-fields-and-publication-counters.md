---
id: f-community-reconciliation-omits-canonical-comment-fields-and-publication-counters
kind: note
note_kind: finding
created: 2026-08-14T09:26:00Z
created_by: a-root
about: "[[t-01KZYG57FETV6T5AGJF939HCCF]]"
severity: major
---
# Community reconciliation omits canonical comment fields and publication counters
Comparator can return ready with altered content/authorId/authorTag because it compares IDs, relationships, counters, timestamps only and lacks publication comment_count. Compare canonical content, mapped ownership/profile linkage, author fields, and nota-level counters with negative self-tests.
