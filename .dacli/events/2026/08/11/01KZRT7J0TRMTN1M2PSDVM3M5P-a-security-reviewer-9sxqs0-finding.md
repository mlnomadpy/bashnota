---
id: 01KZRT7J0TRMTN1M2PSDVM3M5P
kind: event
event_kind: finding
created: 2026-08-11T16:24:30Z
created_by: a-security-reviewer-9sxqs0
about: "[[t-01KZRSXR1YDMQZS0GCG1D4WSGR]]"
origin: agent
applied: true
---
Jupyter token sent in URL query, forced over http, and logged

src/services/codeExecutionService.ts: getBaseUrl (lines 11-14) prefixes http:// (never https) whenever server.ip lacks a protocol, so tokens travel in cleartext by default. getUrlWithToken (lines 16-23) and getWebSocketUrl (lines 25-36) append the kernel/session token as a ?token= query parameter on every REST and WebSocket request. createKernel then logs the full tokenized URL at line 64 (logger.log of the token-bearing url). Query-string secrets leak via browser history, Referer headers, and any intermediary/proxy logs, and the console log persists the token in app logs. Fix: pass the token in an Authorization header instead of the query string, prefer wss/https, and stop logging the tokenized URL. jupyterService.ts (axios) should get the same treatment - verify its auth header usage.
