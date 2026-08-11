---
id: 01KZRV840APAR432WF9GBXC36K
kind: event
event_kind: finding
created: 2026-08-11T16:42:17Z
created_by: a-slice-auditor-9gyqp5
about: "[[001]]"
origin: agent
applied: false
---
Store-overlap matrix for the four nav/layout stores: only one of six pairs overlaps

Answering the 4-store overlap question (layoutStore, sidebarStore, uiStore, simplifiedNavigationStore) with exact fields. Only ONE pair shares state: sidebarStore and simplifiedNavigationStore both own panel/sidebar OPEN state. sidebarStore.sidebars[id].isOpen (sidebarStore.ts:9,49) duplicates simplifiedNavigationStore.leftSidebarOpen + rightPanelContent(ai/none)/isRightPanelOpen + bottomPanelContent (simplifiedNavigationStore.ts:18-25). They serve mutually-exclusive nav modes (sidebarStore to legacy via BaseSidebar; simplifiedNavigationStore only for the 3 flag-gated components ThreePanelLayout/SimplifiedMenubar/CommandPalette), so no simultaneous race, but the concept 'is the AI/right panel open' is modeled twice. The other five pairs are DISJOINT: layoutStore owns editor split panes only (panes[], activePane, draggedTab, tabHistory at layoutStore.ts:19-21); uiStore owns save-indicator (isSaving/showSaved) plus toolbar (isToolbarVisible/isToolbarLocked at uiStore.ts:9-14). Neither layoutStore nor uiStore overlaps any of the other three. NOTE outside these four: layoutStore.pane.notaId/tabHistory overlaps tabsStore per sibling 01KZRT9S7V, and the bigger legacy-sidebar duplication is sidebarStore vs the useSidebarManager composable (see my dual-owner finding).
