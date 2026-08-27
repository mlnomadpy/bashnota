---
id: f-compatibility-settings-retained-credentials-outside-hardened-stores
kind: note
note_kind: finding
created: 2026-08-27T09:53:07Z
created_by: a-security-fixer-sk5tgf
about: "[[t-01M10BZYVVK03HWKPG17RXAVSV]]"
severity: major
---
# Compatibility settings retained credentials outside hardened stores
At 7a7da0b, src/services/settingsAdapter.ts:25-41 read and wrote bashnota-consolidated-settings verbatim, while src/services/consolidatedSettingsService.ts:101-132 persisted/exported its in-memory schema without recursive credential stripping. Legacy ai-settings and integration(s)-settings could therefore retain provider apiKey/apiKeys and Jupyter token fields after migration.
