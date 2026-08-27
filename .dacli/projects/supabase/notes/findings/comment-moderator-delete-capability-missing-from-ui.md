---
id: f-comment-moderator-delete-capability-missing-from-ui
kind: note
note_kind: finding
created: 2026-08-14T09:26:00Z
created_by: a-root
about: "[[t-01KZYG57FETV6T5AGJF939HCCF]]"
severity: major
---
# Comment moderator delete capability missing from UI
SQL allows publication owner moderation, but query/UI only exposes comment-author ownership. Return caller-specific canDelete for author or nota owner and mount moderator vs other-user behavior.
