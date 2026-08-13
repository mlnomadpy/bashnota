---
id: f-extended-the-phase-0-pm-primitives-to-cover-phase-2-nodes-content-defining
kind: note
note_kind: finding
created: 2026-08-11T21:05:50Z
created_by: a-pm-porter-ztd7jc
about: "[[003]]"
severity: moderate
---
# Extended the Phase-0 pm primitives to cover Phase-2 nodes: content/defining/isolating specs, component-less nodes, configured HTMLAttributes, TipTap-faithful parse merge
To port the 12 nodes, defineNode/toTiptapNode gained (all additive, youtube unaffected): (1) defineNode supports isolating (math, theorem) and now sets content when '' (bibliography, subNotaLink) and draggable. (2) toTiptapNode passes content/defining/isolating through to Node.create. (3) toTiptapNode accepts a null component for schema-only nodes (pageLink had no addNodeView) and skips addNodeView. (4) toTiptapNode.parseHTML now passes the definition's raw parse rules through UNCHANGED including rule-level getAttrs (subfigure reconstructs from child DOM), letting TipTap's injectExtensionAttributesToParseRule layer per-attribute parseHTML on top exactly as before. (5) mergeOptionAttrs merges configured HTMLAttributes (.configure class: math-block/data-table/bibliography-block) into toDOM's outer element. (6) defineNode.wrapParseRule was corrected to match TipTap's injectExtensionAttributesToParseRule semantics: rule getAttrs first, then per-attribute parseHTML wins but only for non-null values (so subfigure caption/label derived from children are not clobbered). onUpdate passthrough added for citation renumbering. Files: src/features/editor/pm/defineNode.ts, tiptapAdapter.ts.
