---
id: 01KZRV3JM5K4B3QXSQEMBTFQZJ
kind: event
event_kind: finding
created: 2026-08-11T16:39:48Z
created_by: a-slice-auditor-qva3ya
about: "[[001]]"
origin: agent
applied: false
---
isAdmin getter is dead code with a hardcoded production admin UID

stores/auth.ts:24-34 defines an isAdmin getter that matches state.user.uid against a hardcoded array ['YQBcqDhwkKMtNbh1WmdFp2bFBXk1']. Whole-repo grep for 'isAdmin' (excluding this definition) returns ZERO importers — no component, route, or guard reads it. Grade: dead. Two consequences: (1) any admin-only capability the getter was meant to gate is unenforced — there is no admin route or admin UI wired to it; (2) a real admin account's UID is committed and shipped in the client bundle. A UID is not itself a credential, but it names an admin account and the intent (client-side admin gating) is unsafe by design since Firestore rules — the real boundary — contain no admin concept (firestore.rules has no admin clause). If admin power is ever needed, it must live in rules/functions, not this getter.
