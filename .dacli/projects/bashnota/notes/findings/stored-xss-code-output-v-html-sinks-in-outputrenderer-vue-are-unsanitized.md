---
id: f-stored-xss-code-output-v-html-sinks-in-outputrenderer-vue-are-unsanitized
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-security-reviewer-9sxqs0
about: "[[t-01KZRSXR1YDMQZS0GCG1D4WSGR]]"
source_event: 01KZRT68YHM6455JJS4NZFA948
---
# Stored XSS: code-output v-html sinks in OutputRenderer.vue are unsanitized
src/features/editor/components/blocks/executable-code-block/OutputRenderer.vue renders code-execution output through v-html at three sinks with NO DOMPurify: line 590 (text: v-html=safeFormattedContent), line 596 (json: v-html=safeHighlightedJson), line 624 (error: v-html=formattedErrorOutput). None of the producers escape HTML: ansiToHtml -> processAnsiToHtml in src/lib/utils.ts:61 only substitutes ANSI escape sequences and returns all other text (including <, >) verbatim on the success path; highlightJson (OutputRenderer.vue:370) and formatCodeOutput (OutputRenderer.vue:405) wrap raw content in spans without escaping. The only guard, containsUnsafeHTML (OutputRenderer.vue:111-122), (a) only gates the TEXT path, not json/error, and (b) is bypassable: its allowlist regex /<(?!\/?(span|div|br|p|strong|em|b|i|u|pre|code)(\s|>))[^>]+>/i does NOT flag an event handler on an allowlisted tag, so <div onmouseover=alert(document.cookie)> passes to v-html. The error path is trivially reachable: any output containing the word 'error'/'exception'/'traceback'/'failed' sets hasError (OutputRenderer.vue:380) and renders the error div v-html (line 620-624), e.g. output 'error <img src=x onerror=alert(1)>'. Reach is CROSS-USER: published notas render these outputs read-only via src/features/editor/components/NotaContentViewer.vue -> ExecutableCodeBlock.vue:36,464 (isPublishedView) and publishedNotas is world-readable (firestore.rules:61). A malicious .nota opened locally triggers it identically. Impact: attacker JS runs on victim origin; with the auth token in web storage this enables session/account takeover.
