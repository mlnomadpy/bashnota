---
id: f-gemini-axios-errors-retain-credential-headers-across-raw-ui-logging
kind: note
note_kind: finding
created: 2026-08-27T11:20:12Z
created_by: a-root
about: "[[bashnota/048-redact-credentials-and-harden-ai-and-jupyter-trust-boundaries]]"
severity: major
origin: src/features/ai/services/utils.ts:112
---
# Gemini Axios errors retain credential headers across raw UI logging
Axios failures preserve x-goog-api-key in error.config.headers, are rethrown unchanged, and reach raw console.error paths. Repair requires credential-free errors and central logger routing with sentinel console-spy coverage.
