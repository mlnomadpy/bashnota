---
id: f-product-intent-bashnota-is-a-local-first-code-and-ai-native-research-notebook
kind: note
note_kind: finding
created: 2026-08-11T19:45:21Z
created_by: a-product-analyst-hph7zg
about: "[[t-01KZRTSZTTP1YCS6BPXZ1ABGYR]]"
source_event: 01KZRVNB3ZH8RYTAQ2JG1GK213
---
# Product intent: BashNota is a local-first, code-and-AI-native research notebook with a publish-to-web social layer
Derived from code, not README. Evidence:

WHAT IT IS (defensible in one paragraph): BashNota is a local-first executable research notebook. The document unit ('nota') is not prose but an ordered tree of TYPED blocks persisted across 22 dedicated Dexie tables (src/db.ts:37-96) reassembled via a blockStructures index (db.ts:60,95). The block palette is the tell: it is dominated by research/ML instruments, not note-taking primitives -- Jupyter-executable code blocks (ExecutableCodeBlockExtension.ts), a Vue-Flow DAG 'pipeline' block, a confusion-matrix block with accuracy/precision/recall stats, a theorem block, subfigure/figure composition, LaTeX math (KaTeX), and an academic citation+bibliography system with BibTeX import. On top of the notebook sits a Firebase-backed publishing/social layer ('bashhub'): publish a nota to a public URL (/p/:id, /@:userTag/:notaId per router/index.ts:67,80), user profiles, votes, threaded comments, view stats, and clone-a-published-nota. AI is woven in as an assistant to code (explain/optimize/fix-error) and to text, with a genuine in-browser inference provider (WebLLM/WebGPU) alongside Gemini and Ollama. 

ONE-LINE: it is a *local-first Jupyter-notebook-meets-Notion for ML/research authors who also want to publish their work as interactive public pages* -- NOT a generic note app.

IS THE CODE POINTED AT THAT? Mostly yes for authoring (executable blocks, ML blocks, citations, publishing all COMPLETE), but the product stalled mid-migration: storage/navigation/settings forks are half-wired (see sibling architecture findings), and the standalone AI chat sidebar + inline-AI block -- the pieces that would make it 'AI-native' beyond code -- are orphaned/unreachable. Git: active Feb-Aug 2025, migration burst Dec 2025 (88 commits), last commit 2025-12-13, untouched ~8 months since.
