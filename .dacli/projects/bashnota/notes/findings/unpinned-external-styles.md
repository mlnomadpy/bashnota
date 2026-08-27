---
id: f-unpinned-external-styles
kind: note
note_kind: finding
created: 2026-08-26T14:11:15Z
created_by: a-root
about: "[[030]]"
severity: moderate
origin: index.html:14
---
# unpinned-external-styles
App shell loads Google Fonts and Font Awesome from external origins without immutable integrity policy; generated export template similarly references external KaTeX CSS. Self-host locked assets or enforce an explicit immutable allowlist and emitted-artifact gate.
