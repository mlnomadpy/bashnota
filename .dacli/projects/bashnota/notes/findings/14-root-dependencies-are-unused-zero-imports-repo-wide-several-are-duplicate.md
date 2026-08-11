---
id: f-14-root-dependencies-are-unused-zero-imports-repo-wide-several-are-duplicate
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-tooling-reviewer-mfed01
about: "[[t-01KZRSXR3BZN6YK9YG0VCZMVPW]]"
source_event: 01KZRTGM7PKQV91B0PVC7APJBX
---
# 14 root dependencies are unused (zero imports repo-wide); several are duplicate/superseded pairs and 3 are accidental-install junk (i, install, npm)
Verified by ripgrep across the repo (node_modules excluded via .gitignore); every package below has ZERO import/require occurrence in src or config — only package.json/package-lock.json/README mention them. JUNK (accidental npm-i artifacts): 'i'@0.3.7 (package.json:77), 'install'@0.13.0 (:78), 'npm'@11.1.0 (:88) — 'npm' pulls the entire npm CLI into node_modules as a runtime dep. UNUSED/SUPERSEDED: 'radix-vue'@1.9.13 (:90) 0 imports — reka-ui (:91) is its rename and is used in 168 files under src/components/ui/**; 'vue-toast-notification'@3.1.3 (:110) 0 imports — vue-sonner (:109) is used instead; 'localforage'@1.10.0 (:81) 0 imports — dexie (src/db.ts) is the storage layer; 'mathjax'@3.2.2 (:85) and 'mathjax-full'@3.2.2 (:86) 0 imports — MathJax is loaded as a CDN window global (src/features/editor/composables/useMathJax.ts:14) and katex is the bundled renderer; '@codemirror/gutter'@0.19.9 (:18) and '@codemirror/highlight'@0.19.8 (:19) 0 imports — these are pre-6.0 transitional CM packages, superseded by @codemirror/view / @codemirror/language which the code uses; 'unist'@0.0.1 (:100) 0 imports — a 0.0.1 placeholder pkg (unist-util-visit is the real one); 'html-to-markdown'@1.0.0 (:76) 0 imports; 'remark-parse'@11.0.0 (:92) and 'unified'@11.0.5 (:99) 0 imports — an abandoned unified/remark pipeline; the app parses markdown with 'marked' (used in src/ui/markdown-renderer/MarkdownRenderer.vue and HelpDialog.vue). Removing these 14 trims install size (esp. 'npm', mathjax x2, web-llm-adjacent) and removes two full duplicate UI/toast stacks.
