---
id: f-consolidated-settings-compatibility-persists-credentials-unsanitized
kind: note
note_kind: finding
created: 2026-08-27T09:47:40Z
created_by: a-root
about: "[[bashnota/048-redact-credentials-and-harden-ai-and-jupyter-trust-boundaries]]"
severity: major
---
# consolidated settings compatibility persists credentials unsanitized
settingsAdapter and consolidatedSettingsService still read/write/export bashnota-consolidated-settings without credential scrubbing, outside the three keys in new tests. Cover the active compatibility layer, migrate/scrub legacy values before read/export, and prove no provider/Jupyter secret remains in any persisted/exported settings path.
