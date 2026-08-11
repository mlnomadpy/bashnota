---
id: 01KZRVPM57WT5F63D1NZ22XGP9
kind: event
event_kind: finding
created: 2026-08-11T16:50:12Z
created_by: a-product-analyst-hph7zg
about: "[[010]]"
origin: agent
applied: false
---
Orphaned capability: built-and-working features nothing routes to or surfaces (cheapest value to recover)

Fully built code that no UI path reaches. Ranked by recovery value.

1. STANDALONE AI CHAT SIDEBAR + CONVERSATION PERSISTENCE -- orphaned, high value. AIAssistantSidebar.vue, useAIGeneration.ts (generateText:152, continueConversation:348, regenerateText:460), streaming (useStreamingMode.ts), @-mention nota context injection (useMentions.ts:216-260), and the Dexie 'conversations' table (db.ts:34,69; aiConversationStore.ts read/write) are all built and internally consistent. But every generate handler early-returns unless activeAIBlock is set (AIAssistantSidebar.vue:193,256,315), and activeAIBlock is set ONLY by the window 'activate-ai-assistant' event (AIAssistantSidebar.vue:568) which NOTHING in src dispatches. The comment at AIAssistantSidebar.vue:564 says it comes from 'InlineAIGeneration components' that do not exist. Net: sidebar opens but cannot generate or load history; the conversations table is never populated in prod. A full AI-chat-over-your-notes feature is ~one entry-point wire away.

2. /favorites ROUTE (FavoritesView.vue) -- orphaned. Defined router/index.ts:19-22 but nothing in the UI calls router.push('/favorites') or {name:'favorites'}; the 'Favorites' sidebar item (AppSidebar.vue:105-108) sets an in-page filter instead. Reachable only by typing the URL.

3. MIGRATION ENGINE + DIALOG -- orphaned (confirmed by sibling a-architecture-reviewer). MigrationService + MigrationDialog.vue fully built, zero prod callers; switching storage mode runs no migration.

4. inline aiGeneration TipTap commands -- dead. insertInlineAIGeneration / generateInlineAI declared only as TS types (editor/types/tiptap.d.ts:9-19), never implemented.

5. AIProvidersSettings.vue -- orphaned/legacy, commented out of settings nav (SettingsView.vue:87 'Providers (Legacy)').

6. functions /vote/:id endpoint (functions/routes/nota.ts:323) -- unused; client votes go direct to Firestore via statisticsService.recordVote. Two parallel vote implementations.

7. Duplicate youtube extension file youtube-block/YoutubeExtension.ts (capital Y) -- unused duplicate; index.ts imports the lowercase youtube-extension.ts.

8. CachedStorageService (~156 LOC) -- orphaned (sibling confirmed), implements IStorageBackend but no writer.

The single highest-leverage recovery is #1: the AI-chat-with-note-context pipeline is ~complete and just needs an insertion entry point.
