---
id: 01KZRV7870JZHX0TVV6940GS6P
kind: event
event_kind: finding
created: 2026-08-11T16:41:49Z
created_by: a-slice-auditor-9gyqp5
about: "[[001]]"
origin: agent
applied: false
---
Legacy sidebar open-state has TWO owners with two localStorage schemas: useSidebarManager (real) vs sidebarStore (BaseSidebar only)

The shipped legacy shell tracks the SAME 7 sidebars (toc/references/jupyter/ai/metadata/favorites/subNotas) in two independent stores that never sync. (1) src/composables/useSidebarManager.ts holds a module-level reactive sidebarStates:Record<SidebarId,{isOpen,isAvailable,isPinned}> (useSidebarManager.ts:125-133), persists to localStorage key 'editor-sidebar-states' (line 145,257), and IS the real owner: App.vue, RightSidebarContainer.vue, PinnedSidebars.vue and AppMenubar all drive it. Its toggleSidebar (line 196) closes all others and opens one. (2) src/stores/sidebarStore.ts (Pinia, 183 LOC) holds its OWN sidebars:Record<string,{isOpen,width,...}> (sidebarStore.ts:28), persists to per-id keys 'sidebar-state-<id>' (line 116,128) and is imported by exactly ONE component, src/ui/sidebars/BaseSidebar.vue:42 (used by MetadataSidebarContent + FavoriteBlocksSidebarContent). Consequence: for the metadata/favorites sidebars, open/close is decided by useSidebarManager while width (and a SECOND isOpen) is decided by sidebarStore under a different key. The two isOpen flags can disagree, and there is no reconciliation on load — a user resizing/opening via one path sees stale state via the other after reload. sidebarStore is 90% redundant with useSidebarManager; only its width logic is unique.
