---
id: r-stored-xss-through-published-notas
kind: risk
created: 2026-08-11T16:30:03Z
created_by: a-root
impact: high
likelihood: medium
---
# Stored XSS through published notas
## Indicators
- Notas authored by one user render in another user's browser at /p/:id and /@:userTag/:notaId
- Multiple HTML-producing paths: MarkdownParserService, tiptap-markdown, marked, mermaid, katex, mathjax, drawio
## Action
Security-reviewer must trace every v-html and innerHTML to a DOMPurify call or file a finding
