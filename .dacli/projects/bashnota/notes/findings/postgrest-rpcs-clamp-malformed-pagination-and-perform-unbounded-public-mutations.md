---
id: f-postgrest-rpcs-clamp-malformed-pagination-and-perform-unbounded-public-mutations
kind: note
note_kind: finding
created: 2026-08-27T01:13:10Z
created_by: a-security-fixer-3fpv88
about: "[[t-01M10BZYP58YET7T0SEWJP0GZ8]]"
severity: major
---
# PostgREST RPCs clamp malformed pagination and perform unbounded public mutations
supabase/migrations/20260813000500_publishing_and_view_statistics.sql:40-74 silently clamps arbitrary p_limit values and lines 79-157 accept unbounded IDs/title/content/tags; record_nota_view at lines 195-230 performs writes with no request quota. supabase/migrations/20260813000600_community_interactions.sql:66-88 similarly clamps pagination, while no production pre-request rate/auth boundary exists. netlify.toml:10-21 only defines manifest/cache headers.
