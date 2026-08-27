---
id: f-vote-policies-allow-counter-mutation-on-private-targets
kind: note
note_kind: finding
created: 2026-08-13T22:43:22Z
created_by: a-root
about: "[[t-01KZYG3W31CADGKFQMD86D1VYY]]"
severity: major
---
# Vote policies allow counter mutation on private targets
nota_votes/comment_votes policies validate caller identity but not target visibility at migration lines 380-384 and 399-403. Review reproduced user B voting secret user-A nota, incrementing its SECURITY DEFINER-maintained counter. Restrict to eligible public targets and add private nota/comment denial plus unchanged-counter tests.
