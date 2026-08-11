---
id: 01KZRT7ZC1XDPDGPE4X4Q2FPD5
kind: event
event_kind: finding
created: 2026-08-11T16:24:44Z
created_by: a-security-reviewer-9sxqs0
about: "[[t-01KZRSXR1YDMQZS0GCG1D4WSGR]]"
origin: agent
applied: true
---
FSA directory-handle persistence: no scope escalation; minor over-broad readwrite request

Criterion check (directoryHandleStorage.ts scope-escalation / stale-permission): The stored FileSystemDirectoryHandle is opaque and browser-scoped to exactly the directory the user picked via the picker; persisting it in IndexedDB (saveDirectoryHandle :41-69) cannot widen its scope - the File System Access API, not this code, enforces the boundary, and a serialized handle grants no path outside the chosen root. Stale-permission handling is correct: verifyHandlePermission (:146-166) calls queryPermission first and only returns true on 'granted', otherwise attempts requestPermission (which the browser only honors under a user gesture) and returns false on denial/exception, so a revoked grant (e.g. after browser restart) fails closed. No absolute-path or symlink escalation is reachable from this module. Minor hardening only: it always requests mode:'readwrite' (:153,:160) even when a caller only needs read, so it over-asks for write; scope the mode to the actual need. No security finding of substance here.
