---
id: d-removed-exactly-the-14-unused-deps-named-by-the-wave-1-tooling-review-finding
kind: note
note_kind: decision
created: 2026-08-11T16:59:49Z
created_by: a-fixer-e3zd2c
about: "[[007]]"
---
# Removed exactly the 14 unused deps named by the wave-1 tooling review (finding 01KZRTGM7P); left unist-util-visit in place though it is also zero-import
## Chose
Removed exactly the 14 unused deps named by the wave-1 tooling review (finding 01KZRTGM7P); left unist-util-visit in place though it is also zero-import
## Rejected
Also removing unist-util-visit as a 15th unused dep
## Because
Acceptance criterion says 'the 14 unused root dependencies identified by the wave-1 tooling review'. The reviewer's finding body enumerates exactly 14 and deliberately excluded unist-util-visit ('unist-util-visit is the real one'). Matching the named 14 keeps the change verifiable against acceptance; unist-util-visit's removal is a separate, later decision.
