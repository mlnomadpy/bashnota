---
id: f-youtube-extension-ts-is-now-orphaned-after-the-port-both-old-youtube-files-are
kind: note
note_kind: finding
created: 2026-08-11T19:40:52Z
created_by: a-pm-porter-33tj2x
about: "[[001]]"
severity: minor
---
# youtube-extension.ts is now orphaned after the port; both old youtube files are dead
extensions/index.ts:35 now imports Youtube from youtube-block/youtube.node (the port). The previously-live youtube-extension.ts is no longer imported anywhere, joining the already-dead YoutubeExtension.ts and the youtube-block/index.ts barrel (still points at the dead YoutubeExtension.ts). Left in place deliberately — deleting dead code is out of scope for this port task and app builds/runs regardless. A later cleanup pass should remove youtube-extension.ts, YoutubeExtension.ts, and fix or drop youtube-block/index.ts. The original YoutubeBlock.vue is also now only referenced by those dead files; the live component is YoutubeBlockView.vue.
