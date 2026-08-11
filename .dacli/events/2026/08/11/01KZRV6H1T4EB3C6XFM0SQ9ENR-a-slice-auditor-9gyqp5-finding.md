---
id: 01KZRV6H1T4EB3C6XFM0SQ9ENR
kind: event
event_kind: finding
created: 2026-08-11T16:41:25Z
created_by: a-slice-auditor-9gyqp5
about: "[[001]]"
origin: agent
applied: false
---
MenubarSidebars.vue is dead: only App.vue.backup imports it, unreachable in both nav modes

src/components/MenubarSidebars.vue (a 7-sidebar dropdown component from NAVBAR_SIMPLIFICATION_PLAN) has ZERO live importers. Whole-repo grep: the only import is src/App.vue.backup:20 (a non-compiled .backup file), plus docs (COMPLETE_MIGRATION_SUMMARY.md, NAVBAR_SIMPLIFICATION_PLAN.md). The shipped src/App.vue does NOT import it: its v-if=useSimplifiedNavigation branch (App.vue:308-322) renders SimplifiedMenubar/ThreePanelLayout/CommandPalette, and its v-else legacy branch (App.vue:333-399) renders AppMenubar+PinnedSidebars, never MenubarSidebars. So it is reachable in NEITHER the default nor the flagged configuration. User-visible consequence: the intended 'access ALL sidebars from one dropdown' affordance never ships; legacy-mode users can only reach sidebars via AppMenubar + pinned ones (PinnedSidebars). Dead code, safe-delete candidate.
