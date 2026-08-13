---
id: f-bibliography-attributes-never-round-trip-through-html-parsehtml-reads-bare
kind: note
note_kind: finding
created: 2026-08-11T21:05:39Z
created_by: a-pm-porter-ztd7jc
about: "[[003]]"
severity: minor
---
# bibliography attributes never round-trip through HTML (parseHTML reads bare names, renderHTML writes data-*); persist via document JSON
citation-block/CitationExtension.ts bibliography: the original had no per-attribute parseHTML, so TipTap's default read getAttribute('style'|'sortBy'|...) while renderHTML wrote data-style/data-sort-by/etc. The keys never matched, so an HTML parse always reset every bibliography attribute to its default. Reproduced verbatim in the port (not fixed, per like-for-like). Bibliography state persists through the nota's ProseMirror JSON, so this is invisible in normal use and only affects HTML paste/import. The round-trip test asserts this faithful behavior (node parses back as type 'bibliography' with toDOM emitting the intended data-* attrs).
