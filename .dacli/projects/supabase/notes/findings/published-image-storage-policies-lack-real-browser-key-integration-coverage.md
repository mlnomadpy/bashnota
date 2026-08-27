---
id: f-published-image-storage-policies-lack-real-browser-key-integration-coverage
kind: note
note_kind: finding
created: 2026-08-19T12:10:33Z
created_by: a-root
about: "[[t-01M0AN95FCS0QPWGRFK8D6Q7KB]]"
severity: moderate
origin: supabase/tests/database/runtime_storage.test.sql:24
---
# Published-image storage policies lack real browser-key integration coverage
Current pgTAP only counts three policy names and unit tests mock the client. Add local Storage API integration proving anonymous public read, authenticated owner upload/delete, cross-owner denial, and MIME/size enforcement using browser-safe credentials.
