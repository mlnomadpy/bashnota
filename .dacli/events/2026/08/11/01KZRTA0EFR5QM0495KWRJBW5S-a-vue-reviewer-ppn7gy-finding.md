---
id: 01KZRTA0EFR5QM0495KWRJBW5S
kind: event
event_kind: finding
created: 2026-08-11T16:25:50Z
created_by: a-vue-reviewer-ppn7gy
about: "[[t-01KZRSXR2NWWQWDQXHT68B2EGW]]"
origin: src/stores/simplifiedNavigationStore.ts:16
applied: true
---
sidebarStore and simplifiedNavigationStore both own sidebar/panel open state (mid-migration duplication)

simplifiedNavigationStore's own header (lines 1-8) says it 'Replaces complex 7-sidebar system with 3 simple panels' and owns leftSidebarOpen/rightPanelContent/bottomPanelContent (18-21). The older sidebarStore still exists and owns a generic registry sidebars: Record<string,SidebarState> with per-sidebar isOpen/width/position (sidebarStore.ts:28, 49-56) plus persistence. Both stores answer 'is a given side panel open' — two owners of sidebar visibility state left coexisting from an unfinished migration. Consumers can toggle a panel via one store while the other is stale. Fix: complete the migration — pick simplifiedNavigationStore as the owner and delete/retire sidebarStore usages (or vice-versa).
