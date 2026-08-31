---
id: f-audit-found-product-completeness-accessibility-ci-and-performance-gaps
kind: note
note_kind: finding
created: 2026-08-31T00:15:02Z
created_by: a-root
about: "[[t-01M1AJ9H4JNYZNWCKKHGP33W6Q]]"
severity: major
scope: project
origin: src/features/settings/views/SettingsView.vue:220
---
# Audit found product completeness, accessibility, CI, and performance gaps
Confirmed: several visible editor, Jupyter, settings, account, and alternate-shell actions are stubs or misrouted; settings and other layouts are not mobile-ready; accessible names and keyboard semantics are incomplete; lint passes with 318 warnings; CI omits Supabase and iframe security suites; large deferred chunks remain. Type-check, 684 fast tests, production build, PWA lifecycle, nota workflow, export security, Jupyter security, deep links, and asset gates pass. Read-only reviewer transcript was independently reconciled by root.
