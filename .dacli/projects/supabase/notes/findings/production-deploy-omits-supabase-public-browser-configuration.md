---
id: f-production-deploy-omits-supabase-public-browser-configuration
kind: note
note_kind: finding
created: 2026-08-14T00:30:17Z
created_by: a-root
about: "[[t-01KZYG4G41ARV7RGQ7GCZCDPCK]]"
severity: major
---
# Production deploy omits Supabase public browser configuration
deploy.yml writes Firebase/API vars only, but supabaseBrowser requires VITE_SUPABASE_URL plus publishable/anon key outside DEV. Add URL + publishable key only and a production smoke gate proving no service-role path.
