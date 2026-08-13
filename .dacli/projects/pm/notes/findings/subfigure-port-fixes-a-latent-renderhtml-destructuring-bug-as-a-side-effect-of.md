---
id: f-subfigure-port-fixes-a-latent-renderhtml-destructuring-bug-as-a-side-effect-of
kind: note
note_kind: finding
created: 2026-08-11T21:05:35Z
created_by: a-pm-porter-ztd7jc
about: "[[003]]"
severity: moderate
---
# subfigure port fixes a latent renderHTML destructuring bug as a side effect of the mechanical toDOM translation
The original subfigure-extension.ts renderHTML destructured 'subfigures' out of TipTap's pre-rendered HTMLAttributes, but the subfigures attribute's own renderHTML emitted the key 'data-subfigures' (not 'subfigures'), so the destructured value was always undefined: it emitted data-subfigures='[]' and rendered zero <img> children, silently dropping images from exported/pasted static HTML. defineNode's toDOM receives the ProseMirror node directly (no HTMLAttributes to mis-destructure), so subfigure-extension.ts:toDOM reads node.attrs.subfigures and serialises them correctly. This is the natural mechanical translation, not a deliberate redesign; the side effect is that static-HTML export/round-trip now preserves subfigures. Editor display was unaffected either way (it uses the Vue node view). Flagging so the owner can decide whether to keep the incidental fix or re-introduce the bug for strict parity.
