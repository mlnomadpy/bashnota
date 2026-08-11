---
id: 01KZRV8F4NHCP9RASEATWFMC75
kind: event
event_kind: finding
created: 2026-08-11T16:42:28Z
created_by: a-slice-auditor-9gyqp5
about: "[[001]]"
origin: agent
applied: false
---
Shell reachability map: which menubar/layout components ship by default vs only behind USE_SIMPLIFIED_NAVIGATION

src/App.vue branches on useSimplifiedNavigation (App.vue:41,308,333), backed by USE_SIMPLIFIED_NAVIGATION which defaults FALSE (useFeatureFlags.ts:31, loadFlags 'all off for safety'). DEFAULT shipped config (flag false, v-else branch App.vue:333-399) renders: AppMenubar (App.vue:343), PinnedSidebars (App.vue:361), RightSidebarContainer (App.vue:398), plus AppSidebar. FLAG-ONLY config (flag true, v-if branch App.vue:308-322) renders: SimplifiedMenubar (App.vue:309), ThreePanelLayout (App.vue:310), CommandPalette (App.vue:322). RightSidebarContainer is in BOTH branches so it is default-reachable. MenubarSidebars is in NEITHER branch (only App.vue.backup imports it) = dead. Summary: default-reachable = AppMenubar, PinnedSidebars, RightSidebarContainer. Flag-gated = SimplifiedMenubar, ThreePanelLayout, CommandPalette. Dead = MenubarSidebars. Since the flag has no UI toggle wired outside FeatureFlagToggle.vue and defaults false, the entire simplified 3-panel shell + CommandPalette ship dark to every user.
