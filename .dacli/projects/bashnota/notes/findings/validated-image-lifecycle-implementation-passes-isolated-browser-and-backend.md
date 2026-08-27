---
id: f-validated-image-lifecycle-implementation-passes-isolated-browser-and-backend
kind: note
note_kind: finding
created: 2026-08-27T01:46:19Z
created_by: a-supabase-implementer-66yyfy
about: "[[t-01M10BZYS4VYEQJ5C7BVE438XZ]]"
severity: major
---
# Validated image lifecycle implementation passes isolated browser and backend gates
supabase/functions/_shared/imageValidation.ts:1-99 validates decoded byte size, format signatures/containers, declared MIME, exact termination, dimensions and pixel count before supabase/functions/published-images/index.ts:36-56 stores. Migration supabase/migrations/20260826000200_validated_published_image_lifecycle.sql:1-98 revokes browser mutations, tracks owned references transactionally, interlocks deletion, returns nota-deletion paths and bounds cleanup eligibility. Verification: mutation test failed when MIME agreement was disabled; focused 28/28; full Vitest 592 passed/2 skipped; type-check/build/purity/hygiene passed; clean isolated migration chain applied; runtime/lifecycle/publishing pgTAP 79/79; publishable-key Edge/Storage integration passed. dacli correctly refused implementer acceptance-box mutation for owner a-root.
