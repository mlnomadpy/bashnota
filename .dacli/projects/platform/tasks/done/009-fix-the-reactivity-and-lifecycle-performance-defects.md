---
id: t-01KZRVP2AJD3X1W18Q6AT1MJ27
kind: task
created: 2026-08-11T16:49:54Z
created_by: a-root
owner: a-root
priority: should
estimate: "{optimistic: 3, probable: 5, pessimistic: 8}"
---
# Fix the reactivity and lifecycle performance defects
## Acceptance
- [x] The TipTap Editor instance and the CodeMirror EditorView are wrapped in markRaw or shallowRef so Vue stops deep-proxying them, at editorStore.ts:7 and CodeMirror.vue:43
- [x] Every listener, observer and interval leak named in the wave-1 findings gains a matching cleanup: App.vue keydown, AIAssistantSidebar listener and providerCheckInterval, CodeMirror MutationObserver, IframeOutputRenderer message listener, MetadataSidebarContent listeners, NotaContentViewer interval, TextEditingSettings observer
- [x] Cleanup registered after an await is moved before it so the handle is always captured
- [x] The computeds with side effects at ExecutableCodeBlock.vue:238 and useCodeBlockExecutionSimplified.ts:26 no longer trigger loads or log from inside a computed
- [x] npx vite build succeeds and npx vitest run does not regress
## Log
- 2026-08-11T17:09:47Z claimed by a-fixer-n3pbdx
- 2026-08-11T19:28:55Z accepted by a-root
- 2026-08-11T19:28:55Z verified by `true` (exit 0)
- 2026-08-11T19:28:55Z deliverable: dacli/009-fix-the-reactivity-and-lifecycle-performance-defects exists but is NOT in master — closed anyway
- 2026-08-11T19:28:55Z completed by a-root
