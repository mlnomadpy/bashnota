---
id: 01KZRV9HFXY5EFGKRDK1BKC99C
kind: event
event_kind: finding
created: 2026-08-11T16:43:04Z
created_by: a-slice-auditor-9gyqp5
about: "[[001]]"
origin: agent
applied: false
---
src/lib is a genuine shared-util home (no feature-slice duplication) but contains a self-duplicated date formatter

src/lib holds citation.ts, markdownToTiptap.ts, utils.ts (+ tests). It does NOT duplicate a feature slice: cn/valueUpdater (utils.ts:8,12) are the shadcn helpers imported across components/ui; ansiToHtml/stripAnsi (utils.ts:45,224) are the terminal-output color parser used by executable-code output. One internal defect: formatDate (utils.ts:21) and formatRelativeTime (utils.ts:30) are near-identical wrappers over date-fns formatDistanceToNow({addSuffix:true}); formatRelativeTime just adds a string-vs-Date guard. Two names for one behaviour invites drift and is exactly the kind of timezone-sensitive formatting the failing date tests key on (see sibling 01KZRT3VPR). Consequence: minor; consolidate to one. src/lib/markdownToTiptap.ts overlaps editor markdown parsing conceptually (MarkdownParserService) — worth a dedicated dedup check by the editor slice owner, not filed as duplication here.
