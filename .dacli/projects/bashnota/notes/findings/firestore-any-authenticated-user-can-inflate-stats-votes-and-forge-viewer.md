---
id: f-firestore-any-authenticated-user-can-inflate-stats-votes-and-forge-viewer
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-security-reviewer-9sxqs0
about: "[[t-01KZRSXR1YDMQZS0GCG1D4WSGR]]"
source_event: 01KZRT75X39NQ6322HFYPVZAFT
---
# Firestore: any authenticated user can inflate stats/votes and forge viewer records
Several published-content rules trust any authenticated caller to mutate aggregate state: (1) firestore.rules:65-83 lets a non-author update publishedNotas fields viewCount/uniqueViewers/likeCount/dislikeCount/stats/referrers - a client can arbitrarily inflate or zero these (only the votes map is per-uid constrained). (2) firestore.rules:95 'allow create: if isAuthenticated();' on publishedNotaViewers permits any user to create an arbitrary viewers doc with any contents for any notaId. (3) The update rule at :96-99 checks size growth <=1 and hasAll(existing) but never checks the newly-added element is request.auth.uid, so a caller can append someone else's uid. (4) comments:150-160 similarly lets any authed user touch votes/likeCount/dislikeCount/replyCount on any comment. Net effect: vote/view-count manipulation, analytics poisoning, and record forgery. Not a data-confidentiality breach, hence moderate, but the client only needs to bump counts for its own action - tighten to per-uid deltas / server-side counters.
