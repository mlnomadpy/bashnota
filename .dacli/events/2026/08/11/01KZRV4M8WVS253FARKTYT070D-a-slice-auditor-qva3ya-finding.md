---
id: 01KZRV4M8WVS253FARKTYT070D
kind: event
event_kind: finding
created: 2026-08-11T16:40:23Z
created_by: a-slice-auditor-qva3ya
about: "[[001]]"
origin: agent
applied: false
---
Tag assignment is TOCTOU-racy and unenforced by rules; concurrent signups can collide

userTagGenerator.ts:51-68 isUserTagAvailable does getDoc then callers setDoc separately (services/auth.ts:113-118 createUserTagForNewUser, :149-154 updateUserTag) — a check-then-write with no transaction. generateUniqueUserTag (userTagGenerator.ts:113-144) retries on collision but still ends in a non-atomic setDoc. Firestore rules do not backstop it: /userTags create only requires a valid tag format and the no-op uniqueness check (see separate userTags-rule finding), so a setDoc on an already-taken tag by a DIFFERENT uid is blocked by the UPDATE rule (resource.data.uid must equal caller) — good, that prevents hijack — but two brand-new users generating the same tag in the same window can both pass the availability read and one create silently loses/overwrites depending on ordering. Low probability (random adj+noun+0-999 space), user-visible only as a rare 'tag taken'/lost-tag glitch at signup. Worth a transaction if tag uniqueness matters.
