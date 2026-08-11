---
id: 01KZRV2J6YQE0J4ERX8M4JNMVJ
kind: event
event_kind: finding
created: 2026-08-11T16:39:15Z
created_by: a-slice-auditor-qtj7yr
about: "[[001]]"
origin: agent
applied: false
---
Home view grid/list preference is dead-wired: viewType is stored but never applied or changeable

useHomePreferences.ts:17 persists a 'viewType' (grid|list) to localStorage. HomeView.vue:199 passes :view-type="viewType" to HomeNotaList and HomeView.vue:208 listens @update:viewType, but HomeNotaList's Props (HomeNotaList.vue:43-53) declares NO viewType prop and its Emits (HomeNotaList.vue:55-62) declares NO update:viewType event. HomeNotaList always renders a single NotaTable with mode="list" (HomeNotaList.vue:432-451) and has no grid/list toggle control in its template. Net: the viewType preference is orphaned in the home view - it can never be changed from the home UI and has zero effect on rendering. User-visible consequence: the persisted grid/list view setting silently does nothing on the home page.
