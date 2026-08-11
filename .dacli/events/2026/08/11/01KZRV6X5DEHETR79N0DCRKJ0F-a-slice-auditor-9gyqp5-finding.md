---
id: 01KZRV6X5DEHETR79N0DCRKJ0F
kind: event
event_kind: finding
created: 2026-08-11T16:41:37Z
created_by: a-slice-auditor-9gyqp5
about: "[[001]]"
origin: agent
applied: false
---
src/ui/README.md describes a full shadcn kit that lives elsewhere; src/ui actually holds only 2 things

src/ui/README.md claims src/ui is 'the base UI component library built using shadcn-vue' and lists ~40 components/subdirs (alert, avatar, badge, button, card, command, dialog, table, tabs, etc). Reality: src/ui/ contains ONLY README.md, markdown-renderer/MarkdownRenderer.vue, and sidebars/ (BaseSidebar.vue + 4 small components + index.ts). The actual shadcn-vue kit is in src/components/ui/** (button, card, sidebar, menubar, tabs, ...). Per method (code wins over README) this is a documentation defect: a newcomer reading src/ui/README.md is pointed at the wrong directory for every component it lists. src/ui is NOT a duplicate of a feature slice; it is a tiny second home for a custom MarkdownRenderer and a custom BaseSidebar system that parallels components/ui/sidebar. Fix: rewrite/delete src/ui/README.md.
