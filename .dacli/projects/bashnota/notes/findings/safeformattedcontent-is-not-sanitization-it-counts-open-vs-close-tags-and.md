---
id: f-safeformattedcontent-is-not-sanitization-it-counts-open-vs-close-tags-and
kind: note
note_kind: finding
created: 2026-08-11T16:37:22Z
created_by: a-root
severity: major
origin: src/features/editor/components/blocks/executable-code-block/OutputRenderer.vue:36
---
# safeFormattedContent is not sanitization: it counts open vs close tags and escapes only on MISMATCH, so balanced malicious HTML passes through verbatim
Root verified the security-reviewer finding and sharpened it. OutputRenderer.vue has three v-html sinks (lines 590, 596, 623). Two are named safe* which reads as sanitized; it is not.

safeFormattedContent (line 36) computes openTags = content.match(/<[^/][^>]*>/g).length and closeTags = content.match(/<\\/[^>]*>/g).length, then escapes ONLY when the two counts differ. Therefore:
- <img src=x onerror=alert(1)> -> 1 open, 0 close -> mismatch -> escaped (blocked by luck)
- <script>alert(1)</script>    -> 1 open, 1 close -> balanced -> PASSED THROUGH RAW
- <a href="javascript:...">x</a> -> balanced -> PASSED THROUGH RAW

The heuristic is about HTML well-formedness, not safety, and its name actively misleads the next reader into thinking the sink is covered. formattedErrorOutput (line 435, sink at 623) calls formatCodeOutput with no escaping at all.

dompurify is already a project dependency and is not used here. Attacker: anyone whose code output or execution error reaches another user, which includes any published nota rendered at /p/:id.
