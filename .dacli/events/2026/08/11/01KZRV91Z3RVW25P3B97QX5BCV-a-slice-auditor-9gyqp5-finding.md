---
id: 01KZRV91Z3RVW25P3B97QX5BCV
kind: event
event_kind: finding
created: 2026-08-11T16:42:48Z
created_by: a-slice-auditor-9gyqp5
about: "[[001]]"
origin: agent
applied: false
---
File-relation map: 7 root stores, owners and consumers; sidebarStore is near-dead, uiStore/simplifiedNav narrowly used

src/stores has 7 stores. Consumers (grep-proven, tests excluded): layoutStore (editor split panes; used by App.vue, NotaView, AppTabs/PaneTabs, SplitViewContainer, nota.ts x3) = LIVE central; settingsStore (real settings owner; ~30 consumers) = LIVE; shortcutsStore = LIVE; tabsStore (open notas/active; overlaps layoutStore per 01KZRT9S7V); uiStore (save indicator + toolbar) = narrow: useSaveHandler, UnifiedToolbar, EditorToolbar only; sidebarStore = NEAR-DEAD: imported by exactly ONE component, src/ui/sidebars/BaseSidebar.vue:42 (for width), while the real legacy sidebar-open owner is the useSidebarManager composable (see dual-owner finding); simplifiedNavigationStore = DARK BY DEFAULT: consumed only by the 3 flag-gated components (ThreePanelLayout, SimplifiedMenubar, CommandPalette), so it never activates unless USE_SIMPLIFIED_NAVIGATION is on. Also note two stores share Pinia id 'aiActions' per sibling 01KZRT9MXW (in features/, outside root stores).
