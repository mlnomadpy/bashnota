---
id: 01KZRV3GZ5J8VW0PSH8Z5VQYRQ
kind: event
event_kind: finding
created: 2026-08-11T16:39:46Z
created_by: a-slice-auditor-qtj7yr
about: "[[001]]"
origin: agent
applied: false
---
Slice READMEs describe ~15 components/composables that do not exist; a newcomer following them would be badly misled

The bashhub READMEs document a structure that no longer exists (code wins). components/README.md lists BashHub.vue, HomeAnalytics.vue, HomeQuickActions.vue, HomeRecommendations.vue, HomeSearchBar.vue, HomeTagFilter.vue and a 'bashhub' subdir — none exist (actual components are only HomeHeader.vue, HomeNotaList.vue, NewsletterModal.vue). composables/README.md documents useBashhubData.ts (does not exist) and omits the three real composables (useFilesystemNotas.ts, useNewsletter.ts, and only partially useHomePreferences.ts). welcome/README.md documents ActionCards.vue/QuickInsights.vue/WelcomeGreeting.vue in a components/welcome dir that contains only the README. views/README.md references BashHubView.vue (does not exist). Consequence: any newcomer orienting via these READMEs will look for files that aren't there and miss the ones that are.
