---
id: d-source-legacy-http-bearer-from-cloudapi-session
kind: note
note_kind: decision
created: 2026-08-14T00:21:50Z
created_by: a-root
about: "[[t-01KZYG4G41ARV7RGQ7GCZCDPCK]]"
---
# Source legacy HTTP bearer from CloudApi session
## Chose
Security review found src/services/axios.ts still reading application-managed localStorage.token after the Supabase auth store stopped writing it. Root approved a bounded one-file scope expansion: the interceptor now asks provider-neutral getDefaultCloudApi().auth.currentSession(), sets only an active provider token, and deletes stale authorization for expired, absent, or failed sessions. Focused tests cover all three states.
## Rejected
Leave the localStorage interceptor until publication migration
## Because
That would silently drop authenticated legacy HTTP calls and leave the session migration contract incomplete.
