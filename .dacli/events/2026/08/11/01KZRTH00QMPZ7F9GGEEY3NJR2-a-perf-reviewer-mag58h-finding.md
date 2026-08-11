---
id: 01KZRTH00QMPZ7F9GGEEY3NJR2
kind: event
event_kind: finding
created: 2026-08-11T16:29:39Z
created_by: a-perf-reviewer-mag58h
about: "[[t-01KZRSX0151GFYPXJNE9M9B86Z]]"
origin: agent
applied: true
---
Hot block getters build debug arrays/objects as logger args that run in production even though the log is a no-op

src/services/logger.ts:48-52 guards console.info behind isDevMode, but JS evaluates call ARGUMENTS before invoking logger.info — so the argument-construction cost is paid in production where nothing is logged. In the hot getter blockStore.ts getNotaBlocks (:33-56): line 45 logs inside a .map (one call per block), and line 54 'logger.info(Returning blocks:, blocks.length, blocks.map(b => ({id,type,order})))' allocates a fresh N-object array on EVERY getter call. This getter backs the reactive computed useBlockEditor.ts:21 blocks, so it re-runs on every block mutation while editing. getTiptapContent (blockStore.ts:472-478) similarly builds a debug object each call. For a nota with N blocks this is N iterations + one N-length array allocation per render, purely wasted in prod. Fix: drop the per-item logs or wrap in if(import.meta.env.DEV), and never pass computed/allocated expressions to logger.* . Risk: none (logging only).
