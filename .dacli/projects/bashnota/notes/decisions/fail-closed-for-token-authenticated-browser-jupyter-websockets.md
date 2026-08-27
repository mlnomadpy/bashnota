---
id: d-fail-closed-for-token-authenticated-browser-jupyter-websockets
kind: note
note_kind: decision
created: 2026-08-27T09:53:14Z
created_by: a-security-fixer-sk5tgf
about: "[[t-01M10BZYVVK03HWKPG17RXAVSV]]"
---
# Fail closed for token-authenticated browser Jupyter WebSockets
## Chose
Fail closed for token-authenticated browser Jupyter WebSockets
## Rejected
Append the Jupyter token to the channels URL or silently attempt an unauthenticated WebSocket
## Because
The browser WebSocket API cannot set Authorization headers; query credentials violate the URL-leakage boundary, while an unauthenticated attempt gives misleading execution behavior. Secure cookie-authenticated and credential-free local channels remain available.
