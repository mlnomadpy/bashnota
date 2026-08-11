---
id: 01KZRT7SEJ87SFVGBV0BE387KZ
kind: event
event_kind: finding
created: 2026-08-11T16:24:38Z
created_by: a-security-reviewer-9sxqs0
about: "[[t-01KZRSXR1YDMQZS0GCG1D4WSGR]]"
origin: agent
applied: true
---
No committed secrets; VITE_ Firebase config in bundle is public-by-design, not a leak

Criterion check (secrets / .env / deploy.yml): No secret is committed. .env and all .env.*.local variants are gitignored (.gitignore:76-80); no .env file is tracked; a repo-wide scan for hardcoded Google API keys (AIza...) in src/ and functions/src/ returns nothing. .github/workflows/deploy.yml:19-29 writes the eight VITE_* values from GitHub Actions secrets into .env at build time; Vite inlines any VITE_-prefixed var into the client bundle, so these DO ship to the browser - but that is correct and unavoidable for a Firebase Web app: apiKey/authDomain/projectId/etc. are public identifiers, not credentials (access is gated by firestore.rules/storage.rules and Firebase Auth, which is why the rules findings matter). No server-side/private secret is exposed by this workflow. Conclusion: no secret-leak finding here; recommend restricting the Firebase API key by HTTP referrer in Google Cloud console as defense-in-depth.
