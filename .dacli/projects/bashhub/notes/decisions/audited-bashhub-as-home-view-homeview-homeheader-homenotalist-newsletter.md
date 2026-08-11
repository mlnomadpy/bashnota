---
id: d-audited-bashhub-as-home-view-homeview-homeheader-homenotalist-newsletter
kind: note
note_kind: decision
created: 2026-08-11T16:39:08Z
created_by: a-slice-auditor-qtj7yr
about: "[[001]]"
---
# Audited bashhub as: home view (HomeView+HomeHeader+HomeNotaList+newsletter+filesystem), public profile (UserPublishedView at /@:userTag and /u/:userId), and statisticsService as the slice's public API consumed only by the nota slice
## Chose
Audited bashhub as: home view (HomeView+HomeHeader+HomeNotaList+newsletter+filesystem), public profile (UserPublishedView at /@:userTag and /u/:userId), and statisticsService as the slice's public API consumed only by the nota slice
## Rejected
Treating statisticsService as internal to bashhub
## Because
statisticsService has zero in-slice callers; all consumers (PublicNotaView, VotersList, nota store) live in features/nota, so it is a cross-slice provider, not internal
