---
id: f-live-youtube-extension-is-youtube-extension-ts-not-youtubeextension-ts
kind: note
note_kind: finding
created: 2026-08-11T19:25:54Z
created_by: a-pm-porter-33tj2x
about: "[[001]]"
severity: major
---
# Live youtube extension is youtube-extension.ts, not YoutubeExtension.ts
extensions/index.ts:35 imports { Youtube } from '.../youtube-block/youtube-extension' (lowercase). The capital YoutubeExtension.ts is only re-exported by youtube-block/index.ts:9, and NOTHING imports that barrel (grep for the barrel path returns no matches). So the LIVE spec is the simpler one: attrs url+videoId, parseHTML div[data-type=youtube], renderHTML div[data-type=youtube]. The dead YoutubeExtension.ts has extra startTime/autoplay attrs and parseHTML div[data-youtube-video]. Port the LIVE one; do not port the dead richer file.
