---
id: f-supabase-primary-auth-breaks-still-live-firebase-authenticated-workflows
kind: note
note_kind: finding
created: 2026-08-14T00:30:17Z
created_by: a-root
about: "[[t-01KZYG4G41ARV7RGQ7GCZCDPCK]]"
severity: major
---
# Supabase-primary auth breaks still-live Firebase authenticated workflows
Auth store becomes Supabase-only while publish/image Functions still verify Firebase ID tokens and Firebase compatibility comments/stats/newsletter require auth.currentUser. Supabase JWTs therefore yield 401/unauthenticated. Preserve Firebase-primary compatibility until dependent paths migrate, or atomically dual-verify/migrate them; add actual middleware/service compatibility tests.
