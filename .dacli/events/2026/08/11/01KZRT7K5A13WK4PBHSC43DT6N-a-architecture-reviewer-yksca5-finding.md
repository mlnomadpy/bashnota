---
id: 01KZRT7K5A13WK4PBHSC43DT6N
kind: event
event_kind: finding
created: 2026-08-11T16:24:31Z
created_by: a-architecture-reviewer-yksca5
about: "[[t-01KZRSX01WV40GJGSSYCFMBS7Y]]"
origin: src/App.vue:308
applied: true
---
Two full navigation stacks ship together (~912 LOC new + ~909 LOC legacy); simplified stack is dark behind a default-off flag

App.vue:308-330 renders the NEW simplified stack when useSimplifiedNavigation is true, App.vue:333+ renders the LEGACY stack otherwise (v-else). The flag defaults false (useFeatureFlags.ts:31), so legacy is what users get. Both trees and their stores are bundled unconditionally. NEW: SimplifiedMenubar.vue 295 + ThreePanelLayout.vue 178 + CommandPalette.vue 314 + simplifiedNavigationStore.ts 125 = ~912 LOC. LEGACY: AppMenubar.vue 402 + sidebarStore.ts 183 + layoutStore.ts 324 = ~909 LOC. AppSidebar is shared. So ~900+ LOC of navigation is carried twice and one copy is never exercised in a default install. simplifiedNavigationStore is consumed by ThreePanelLayout.vue:137, CommandPalette.vue:101, SimplifiedMenubar.vue:130 only.
