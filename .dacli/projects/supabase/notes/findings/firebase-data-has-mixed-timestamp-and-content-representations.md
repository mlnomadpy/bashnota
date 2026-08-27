---
id: f-firebase-data-has-mixed-timestamp-and-content-representations
kind: note
note_kind: finding
created: 2026-08-13T21:45:50Z
created_by: a-supabase-implementer-5jrb3a
about: "[[001]]"
severity: moderate
---
# Firebase data has mixed timestamp and content representations
Published nota statistics explicitly accept lastViewedAt as either Firestore Timestamp or serialized string (src/features/bashhub/services/statisticsService.ts:378), while comment content is string in Functions types but any/JSON in client types (functions/src/types/nota.ts:58; src/features/nota/types/nota.ts:132). Staging must retain raw values and quarantine lossy conversions.
