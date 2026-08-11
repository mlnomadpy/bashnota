---
id: 01KZRV9AYD2H6E6D9GGNDB05NQ
kind: event
event_kind: finding
created: 2026-08-11T16:42:57Z
created_by: a-slice-auditor-9gyqp5
about: "[[001]]"
origin: agent
applied: false
---
src/App.vue.backup is a committed 12KB stale shell that keeps dead components importable and confuses the shell audit

src/App.vue.backup (12662 bytes) sits beside the real src/App.vue in the compiled source tree. It is the ONLY thing that still imports MenubarSidebars.vue (App.vue.backup:20), PinnedSidebars (:21) and RightSidebarContainer (:23), which is why a naive grep makes MenubarSidebars look 'used'. Being a .backup extension it is not part of the Vite build, but it is version-controlled, will be picked up by editor search/rename tools, and defeats dead-code detection. User-visible consequence: none at runtime; developer-visible: false-positive liveness for MenubarSidebars and general confusion about which shell is authoritative. Safe-delete candidate (git history preserves it). Also flags a process gap: no lint/CI rule rejects .backup files (corroborates 'never linted').
