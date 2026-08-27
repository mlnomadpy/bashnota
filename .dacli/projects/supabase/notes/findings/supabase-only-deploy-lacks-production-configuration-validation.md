---
id: f-supabase-only-deploy-lacks-production-configuration-validation
kind: note
note_kind: finding
created: 2026-08-19T12:08:20Z
created_by: a-root
about: "[[t-01M0AN95FCS0QPWGRFK8D6Q7KB]]"
severity: major
origin: .github/workflows/deploy.yml:40
---
# Supabase-only deploy lacks production configuration validation
Independent read-only review reproduced that VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY may both be empty while npm run check:backend-purity passes. The sole runtime then throws from src/services/cloud/supabaseBrowser.ts:28-29 after deployment. Add a production configuration smoke gate that validates HTTPS project URL and a browser publishable/anon key while rejecting service-role-like values.
