---
id: d-bootstrap-the-jupyter-login-cookie-with-token-authenticated-credentialed-http
kind: note
note_kind: decision
created: 2026-08-27T10:44:43Z
created_by: a-security-fixer-nvhwty
about: "[[t-01M10BZYVVK03HWKPG17RXAVSV]]"
---
# Bootstrap the Jupyter login cookie with token-authenticated credentialed HTTP before opening channels
## Chose
Bootstrap the Jupyter login cookie with token-authenticated credentialed HTTP before opening channels
## Rejected
Put the token in the WebSocket URL or permanently reject token-bearing server configurations
## Because
Jupyter Server converts successful token-authenticated requests into an HttpOnly login cookie, which the browser can send on the WebSocket upgrade without exposing the token in URL, log, or storage surfaces
