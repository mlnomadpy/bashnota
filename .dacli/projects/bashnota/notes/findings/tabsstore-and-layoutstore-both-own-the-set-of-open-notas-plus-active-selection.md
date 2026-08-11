---
id: f-tabsstore-and-layoutstore-both-own-the-set-of-open-notas-plus-active-selection
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-vue-reviewer-ppn7gy
about: "[[t-01KZRSXR2NWWQWDQXHT68B2EGW]]"
origin: src/stores/tabsStore.ts:19
source_event: 01KZRT9S7V5YNRSS59BH146JWR
---
# tabsStore and layoutStore both own the set of open notas plus active selection
tabsStore holds tabs: Tab[] (id === nota id) + activeTabId, persisted to localStorage 'open-tabs'/'active-tab' (tabsStore.ts:19-20,48-64). layoutStore holds panes[].tabHistory (nota-id arrays) + panes[].notaId + activePane, persisted to 'layout-panes'/'layout-active-pane' (layoutStore.ts:19-20,66-81). Both are the authoritative record of 'which notas are open and which is active'. They are not derived from each other, so they can diverge; tabsStore.closeTab (141-156) dynamically imports layoutStore and manually reaches in to clear/close the matching pane to keep them in sync — the classic symptom of duplicated state. Fix: make one the single source of truth (panes owning tabHistory) and derive the other, or merge into one workspace store.
