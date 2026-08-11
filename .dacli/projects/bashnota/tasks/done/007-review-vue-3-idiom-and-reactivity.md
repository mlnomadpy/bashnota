---
id: t-01KZRSXR2NWWQWDQXHT68B2EGW
kind: task
created: 2026-08-11T16:19:09Z
created_by: a-root
owner: a-root
priority: should
estimate: "{optimistic: 2, probable: 4, pessimistic: 8}"
---
# Review: Vue 3 idiom and reactivity
## Acceptance
- [x] Reports every event listener, interval, observer or watcher created without a matching cleanup in onUnmounted, with file:line
- [x] Identifies reactivity anti-patterns: deep reactive on large structures where shallowRef/markRaw belongs, computed with side effects, watchers that should be computed
- [x] Assesses the 7 root stores plus feature stores for overlapping responsibility, naming any two that own the same state
- [x] Names the components where prop drilling or emit chains exceed 2 levels and suggests provide/inject or a store
- [x] Every finding is filed via 'dacli note add finding' with an --origin of file:line
## Log
- 2026-08-11T16:20:16Z claimed by a-vue-reviewer-ppn7gy
- 2026-08-11T16:37:36Z accepted by a-root (applied 1 proposal(s))
- 2026-08-11T16:37:36Z closed WITHOUT verification — no --verify command was given
- 2026-08-11T16:37:36Z deliverable: no dacli/007-review-vue-3-idiom-and-reactivity branch — nothing to check against master
- 2026-08-11T16:37:36Z completed by a-root
- 2026-08-11T16:37:41Z finding by a-vue-reviewer-ppn7gy: CodeMirror MutationObserver never disconnected on unmount (event 01KZRT3A74RCM7JP2PKP300YXZ)
- 2026-08-11T16:37:41Z finding by a-vue-reviewer-ppn7gy: AIAssistantSidebar leaks window activate-ai-assistant listener on every unmount (event 01KZRT3KHSRBYN7XNWMXAMDB3Q)
- 2026-08-11T16:37:41Z finding by a-vue-reviewer-ppn7gy: IframeOutputRenderer leaks window message listener on unmount (event 01KZRT3KJ23KNNZT2A6HFW0WTB)
- 2026-08-11T16:37:41Z finding by a-vue-reviewer-ppn7gy: TextEditingSettings observer disconnected only on beforeunload, not onUnmounted (event 01KZRT41V24E1SGZRAEAQW48HT)
- 2026-08-11T16:37:41Z finding by a-vue-reviewer-ppn7gy: MetadataSidebarContent adds document/input listeners with anonymous handlers, never removed (event 01KZRT41VA18SDMXYX5SXFVX29)
- 2026-08-11T16:37:41Z finding by a-vue-reviewer-ppn7gy: AIAssistantSidebar providerCheckInterval cleanup registered after await may not bind (event 01KZRT41VHRPWQQSYHSGMMED4W)
- 2026-08-11T16:37:41Z finding by a-vue-reviewer-ppn7gy: NotaContentViewer polling interval not cleared if component unmounts before editor ready (event 01KZRT41VSMC90F8D3DZDBS6R5)
- 2026-08-11T16:37:41Z finding by a-vue-reviewer-ppn7gy: TipTap Editor and component instance stored in deep-reactive plain refs (event 01KZRT6P26VMRVM8R560WSQAP8)
- 2026-08-11T16:37:41Z finding by a-vue-reviewer-ppn7gy: No markRaw/shallowRef/shallowReactive anywhere in the codebase (event 01KZRT6P2DQ3KX5A0N4WNJMMRP)
- 2026-08-11T16:37:41Z finding by a-vue-reviewer-ppn7gy: CodeMirror EditorView held in deep-reactive plain ref (event 01KZRT6P2MP7XAH5ABFEYX0MQG)
- 2026-08-11T16:37:41Z finding by a-vue-reviewer-ppn7gy: Nota store items is a deep-reactive array of full nota trees (event 01KZRT6P2T52NNJPH5GWJ62MKW)
- 2026-08-11T16:37:41Z finding by a-vue-reviewer-ppn7gy: Two different stores registered with the same Pinia id aiActions (event 01KZRT9MXWZZ7N15RP7Y558Q4H)
- 2026-08-11T16:37:41Z finding by a-vue-reviewer-ppn7gy: tabsStore and layoutStore both own the set of open notas plus active selection (event 01KZRT9S7V5YNRSS59BH146JWR)
- 2026-08-11T16:37:41Z finding by a-vue-reviewer-ppn7gy: sidebarStore and simplifiedNavigationStore both own sidebar/panel open state (mid-migration duplication) (event 01KZRTA0EFR5QM0495KWRJBW5S)
- 2026-08-11T16:37:41Z finding by a-vue-reviewer-ppn7gy: App.vue global keydown listener added with anonymous handler and no cleanup (event 01KZRTCAXNF3AA4E8H56ND7KKZ)
- 2026-08-11T16:37:41Z finding by a-vue-reviewer-ppn7gy: blockId prop drilled through 4 executable-code-block layers (event 01KZRTFAW8NGAFJP1RXG9JD6A2)
- 2026-08-11T16:37:41Z finding by a-vue-reviewer-ppn7gy: notaId prop drilled through 4 executable-code-block layers (event 01KZRTFAWMF8BACPRES1939R2T)
- 2026-08-11T16:37:41Z finding by a-vue-reviewer-ppn7gy: tableData prop drilled parent-to-great-grandchild in table-block (event 01KZRTFAX19MWKHGZ7WP9W36BQ)
- 2026-08-11T16:37:41Z finding by a-vue-reviewer-ppn7gy: Cell-update emit re-bubbled through 3 table-block layers (event 01KZRTFQ4RZDZMBRBTZNKJ7HJ6)
- 2026-08-11T16:37:41Z finding by a-vue-reviewer-ppn7gy: AI code-updated / trigger-execution emit re-bubbled through 3 layers (event 01KZRTFQ52W3XPEEVHG9K7TBY3)
- 2026-08-11T16:37:41Z finding by a-vue-reviewer-ppn7gy: availableServers computed triggers a store data-load action as a side effect (event 01KZRTH2PH8S6Z3H6TR4CMJ6RQ)
- 2026-08-11T16:37:41Z finding by a-vue-reviewer-ppn7gy: availableKernels computed contains console.log side effects (event 01KZRTH2PRSBW5YV9H3H3MM455)
- 2026-08-11T16:37:41Z finding by a-vue-reviewer-ppn7gy: Watch used where a computed belongs in useAIRequest (event 01KZRTH2Q1GPAHKDR6JHQQRYRT)
- 2026-08-11T16:37:41Z finding by a-vue-reviewer-ppn7gy: Watch used where a computed belongs in ExportDialog (event 01KZRTH2Q8JNDG7DBSGEZ42E4G)
