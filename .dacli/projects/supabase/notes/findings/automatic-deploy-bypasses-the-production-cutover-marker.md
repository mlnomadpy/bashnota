---
id: f-automatic-deploy-bypasses-the-production-cutover-marker
kind: note
note_kind: finding
created: 2026-08-19T12:10:33Z
created_by: a-root
about: "[[t-01M0AN95FCS0QPWGRFK8D6Q7KB]]"
severity: major
origin: .github/workflows/deploy.yml:22
---
# Automatic deploy bypasses the production cutover marker
All providers are correctly Supabase-only, but deploy runs after every successful master quality build and does not check approved migration/reconciliation evidence or runtime_deployment_state.production_cutover. Because task007 remains blocked/unmerged, merging task010 could deploy before existing data/identities are imported. Keep code Supabase-only but make deployment fail closed until an explicit non-secret approval artifact and restricted database marker are verified.
