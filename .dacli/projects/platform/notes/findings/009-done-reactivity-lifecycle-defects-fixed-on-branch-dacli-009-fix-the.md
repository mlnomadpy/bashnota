---
id: f-009-done-reactivity-lifecycle-defects-fixed-on-branch-dacli-009-fix-the
kind: note
note_kind: finding
created: 2026-08-11T17:16:06Z
created_by: a-fixer-n3pbdx
about: "[[009]]"
severity: major
---
# 009 DONE: reactivity + lifecycle defects fixed on branch dacli/009-fix-the-reactivity-and-lifecycle-performance-defects (commit cfe6b29)
All 5 acceptance criteria met. 10 files changed, no source outside scope.

REACTIVITY (stop deep-proxying heavy instances):
- editorStore.ts:7 — activeEditor now shallowRef<Editor> (was ref). Import adds shallowRef.
- CodeMirror.vue:43 — editorView now shallowRef<EditorView> (was ref).

LIFECYCLE LEAKS (each named leak gets matching cleanup):
- App.vue — global keydown handler hoisted to named handleGlobalKeydown, registered BEFORE the await in onMounted, removed in new onBeforeUnmount.
- AIAssistantSidebar.vue — activate-ai-assistant window listener was an anonymous fn (unremovable): extracted to named handleActivateAIAssistant, added window.removeEventListener in onBeforeUnmount. providerCheckInterval was captured in a LOCAL const with its onBeforeUnmount registered AFTER 'await initializeProviders(false)' (Vue won't attach a hook registered post-await -> 30s interval leak): moved to top-level ref, cleared in onBeforeUnmount; listener/interval setup moved before the await.
- CodeMirror.vue — theme MutationObserver was a local const never disconnected: hoisted to module-scope let, disconnect() added to existing onUnmounted.
- IframeOutputRenderer.vue — window 'message' listener never removed: added onUnmounted removeEventListener (import onUnmounted).
- MetadataSidebarContent.vue — document 'click' + tags-input 'input' listeners anonymous & never removed: named both, added onUnmounted that removes them and clears the pending debounce timeout.
- NotaContentViewer.vue — editor-ready setInterval leaked if unmounted before editor ready: hoisted to readyInterval, cleared in new onUnmounted.
- TextEditingSettings.vue — theme MutationObserver was only disconnected on window 'beforeunload' (never on unmount, and the beforeunload listener itself leaked): hoisted observer, disconnect in new onUnmounted, removed beforeunload approach.

COMPUTEDS WITH SIDE EFFECTS (made pure):
- useCodeBlockExecutionSimplified.ts:26 — availableServers computed called jupyterStore.loadServers() inside the getter; removed (load already happens in initializeComponent/on mount).
- ExecutableCodeBlock.vue:238 — availableKernels computed had 3 console.log calls inside the getter; removed.

VERIFICATION (all run in this worktree):
- npx vue-tsc --build: exits 0, ZERO errors, and find src -name '*.js' = empty (no emitted JS).
- npx vitest run: 24 files / 338 tests, ALL PASS (base already had the 004 timezone fixes; no regression).
- npx vite build: SUCCEEDS in 8.88s, main chunk 10,058.08 kB gzip 3,327.68 kB (matches baseline). CSS @import + chunk-size warnings are pre-existing.

Owner: run dacli accept to verify and check the 5 boxes. Do NOT push/PR per run policy.
