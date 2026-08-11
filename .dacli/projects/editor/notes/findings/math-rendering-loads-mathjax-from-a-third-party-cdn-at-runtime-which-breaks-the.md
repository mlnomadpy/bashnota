---
id: f-math-rendering-loads-mathjax-from-a-third-party-cdn-at-runtime-which-breaks-the
kind: note
note_kind: finding
created: 2026-08-11T17:06:06Z
created_by: a-root
severity: major
origin: src/features/editor/composables/useMathJax.ts:100
---
# Math rendering loads MathJax from a third-party CDN at runtime, which breaks the local-first and offline-PWA promise
Discovered by root while verifying the 007 dead-code deletions.

useMathJax.ts:100 injects a script tag pointing at https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js. It is used by MathDisplay.vue (math-block) and MixedContentDisplay.vue (theorem-block).

This confirms removing the mathjax and mathjax-full npm packages was correct — they were never imported; the real MathJax arrives over the network. But it surfaces three problems the deletion does not fix:

1. OFFLINE. The app is a PWA that precaches 10.6 MB and markets itself as local-first with .nota files on disk. Open a nota containing math with no network and the math silently fails to render. The service worker cannot precache a cross-origin CDN script.

2. SUPPLY CHAIN. An unpinned, unhashed third-party script is executed with full page privileges on every document containing math. There is no integrity attribute and no version lock beyond the major (mathjax@3 resolves to whatever jsdelivr serves today). A jsdelivr compromise is a full app compromise, and this app holds AI API keys in localStorage.

3. REDUNDANCY. katex is a real dependency and IS bundled. The app therefore ships two math renderers by two different mechanisms. Establish which blocks use which, and whether MathJax can be dropped for katex outright — that would remove the CDN dependency, fix offline, and close the supply-chain hole in one change.

Recommendation: prefer bundling katex-only. If MathJax must stay, install it as a real dependency and bundle it rather than fetching it at runtime.
