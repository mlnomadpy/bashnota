---
id: t-01M0F8AY7K2S7E0STZYP77QVC7
kind: task
created: 2026-08-20T09:34:18Z
created_by: a-root
owner: a-root
github:
  issue: 1
  repo: mlnomadpy/bashnota
estimate: "{optimistic: 5, probable: 8, pessimistic: 13}"
---
# Feature request: secure published-content and executable-output rendering
## Context
Adopted from GitHub issue #1.

## Objective

Make all notebook, published-note, and executable-code output rendering safe for untrusted content while preserving rich local output where explicitly permitted.

## Primary implementation areas

- `src/features/editor/components/blocks/executable-code-block/OutputRenderer.vue`
- `src/features/editor/components/blocks/executable-code-block/IframeOutputRenderer.vue`
- `src/features/nota/views/PublicNotaView.vue`
- `src/ui/markdown-renderer/MarkdownRenderer.vue`
- `functions/src/utils/NotaContentProcessor.ts`
- `functions/src/routes/nota.ts`

## Required changes

- Define explicit trust levels for authored content, imported notes, published notes, AI output, and local Jupyter output.
- Replace DOM parsing presented as sanitization with an explicit DOMPurify allowlist.
- Render plain-text output as text by default and allow HTML only through a reviewed rendering path.
- Use a restrictive iframe boundary for rich output. Avoid combining script execution with a same-origin iframe.
- Prefer `srcdoc` plus a restrictive content-security policy for isolated output documents.
- Validate both `event.source` and the expected message shape for iframe resize messages.
- Recursively validate TipTap JSON nodes, marks, attributes, URLs, and HTML-bearing output fields.
- Call the validated content processor from the publish route before writing to Firestore.
- Ensure published notes cannot activate executable output automatically.
- Document the rendering threat model and the supported safe HTML subset.

Do not place proof-of-concept payloads or live deployment details in this public issue. Handle any reproducible exploit details through a private security channel.

## Acceptance criteria

- Published and imported content cannot execute scripts, event handlers, unsafe URLs, or same-origin iframe code.
- Local rich output requires an explicit trust decision and remains isolated from application credentials.
- Publishing rejects content that does not conform to the allowed document schema.
- Security regression tests cover event attributes, unsafe URL schemes, SVG/MathML, malformed markup, iframe messages, code output, and nested TipTap attributes.
- A short architecture decision record explains the trust model and why each allowed capability is necessary.

## Acceptance
## Log
