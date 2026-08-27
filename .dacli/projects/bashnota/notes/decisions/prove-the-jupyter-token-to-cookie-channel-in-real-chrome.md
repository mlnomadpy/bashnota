---
id: d-prove-the-jupyter-token-to-cookie-channel-in-real-chrome
kind: note
note_kind: decision
created: 2026-08-27T11:09:19Z
created_by: a-root
about: "[[bashnota/048-redact-credentials-and-harden-ai-and-jupyter-trust-boundaries]]"
---
# Prove the Jupyter token-to-cookie channel in real Chrome
## Chose
Official Jupyter Server authentication source confirms a successful Authorization token request persists an HttpOnly login cookie. The production boundary now has unit mutation coverage and a blocking real-Chrome gate that performs Authorization-header HTTP bootstrap, opens a credential-free WebSocket using the cookie, executes a request, and asserts the token is absent from DOM and request URLs.
## Rejected
Treat mocked WebSocket tests as sufficient or place the token in the channel URL.
## Because
The task requires functional token-authenticated execution without URL leakage, so browser protocol evidence is the smallest truthful gate.
