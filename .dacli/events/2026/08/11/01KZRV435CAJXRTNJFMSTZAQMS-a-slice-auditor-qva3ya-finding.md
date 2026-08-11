---
id: 01KZRV435CAJXRTNJFMSTZAQMS
kind: event
event_kind: finding
created: 2026-08-11T16:40:05Z
created_by: a-slice-auditor-qva3ya
about: "[[001]]"
origin: agent
applied: false
---
functions backend has NO firebase.json or .firebaserc committed — deploy config is out-of-band

functions/ is a real Express app deployed as one Cloud Function api (functions/src/index.ts:51 export const api = onRequest(app)) mounting /nota /image /comments /authors, auth-gated by verifyIdToken (helpers.ts:16). It is the backend the client hits via VITE_API_URL (services/axios.ts:4). But repo root has NO firebase.json and NO .firebaserc (confirmed by ls and find). So firebase deploy --only functions (functions/package.json) cannot run from a clean checkout, and CI (.github/workflows/deploy.yml) only builds the SPA and pushes dist/ to GitHub Pages — functions are never deployed by CI. Consequence: the running backend is deployed manually from an un-versioned local config, a bus-factor risk, and the client-to-functions contract is untested in CI. Dependency drift is minor: functions dompurify 3.2.4 and jsdom 26.0.0 match root exactly; only TS skews (root 5.7.3 vs functions 5.8.2). firebase-admin 12.6.0 vs client firebase 10.14.1 is expected (different SDKs).
