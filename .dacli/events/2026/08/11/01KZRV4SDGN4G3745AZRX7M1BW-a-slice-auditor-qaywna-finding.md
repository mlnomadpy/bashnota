---
id: 01KZRV4SDGN4G3745AZRX7M1BW
kind: event
event_kind: finding
created: 2026-08-11T16:40:28Z
created_by: a-slice-auditor-qaywna
about: "[[001]]"
origin: agent
applied: false
---
Gemini key sent as URL query param on every request (history/Referer/log exposure)

All six Gemini endpoints pass the key in the query string '?key=<APIKEY>' rather than the x-goog-api-key header (src/features/ai/services/providers/geminiProvider.ts:40,55,84,132,157,443). Query strings are the most log-prone part of a URL: they land in browser history, can appear in Referer headers to any third-party resource loaded by the page, and are captured by intermediary/proxy logs. Google's own guidance is to send the key via header. USER-VISIBLE: elevated key-exposure surface even absent an explicit log statement. Fix is a mechanical move of the key from URL to header in one file.
