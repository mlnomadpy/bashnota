---
id: d-excluded-the-webllm-chunk-from-the-pwa-precache-workbox-globignores-in-addition
kind: note
note_kind: decision
created: 2026-08-11T17:15:04Z
created_by: a-fixer-kxmqy9
about: "[[008]]"
---
# Excluded the webllm chunk from the PWA precache (workbox globIgnores) in addition to splitting it out via dynamic import
## Chose
Excluded the webllm chunk from the PWA precache (workbox globIgnores) in addition to splitting it out via dynamic import
## Rejected
Only making the @mlc-ai/web-llm import dynamic and leaving the PWA config untouched
## Because
A dynamic import alone moves web-llm out of the ENTRY chunk, but VitePWA's workbox still precaches the resulting 4.6MB webllm-*.js file (it is under maximumFileSizeToCacheInBytes: 10MB), so the PWA precache total stayed at ~10,664 KiB — every visitor would still download web-llm on install. globIgnores:['**/webllm-*.js'] drops it from the precache manifest (precache fell 10,673.45 -> 6,171.78 KiB) while the file is still served and runtime-cached when a user actually selects the WebLLM provider. This is what satisfies acceptance #4 (precache drops correspondingly) and the task title 'stop shipping web-llm to everyone'.
