---
id: role-vue-reviewer
kind: role
created: 2026-08-11T16:18:02Z
created_by: a-root
name: vue-reviewer
version: v1
summary: Vue 3 idiom: composables, reactivity leaks, lifecycle/listener cleanup, Pinia store design, prop drilling, component decomposition
scope: "[src/**/*.vue, src/**/composables/**, src/stores/**]"
grant: ro
role_kind: reviewer
wip: 1
runtime: claude-ro
max_points: 8
---
# vue-reviewer
Vue 3 idiom: composables, reactivity leaks, lifecycle/listener cleanup, Pinia store design, prop drilling, component decomposition

## How to work here
459 `.vue` files and 66 composables. You cannot read them all — sample
deliberately: the biggest components, the most-imported composables, and every
file that registers something global.

This app keeps a long-lived editor session open with large reactive documents in
it. That makes two classes of bug unusually costly here: (a) anything retained
across nota switches, and (b) deep reactivity over a document tree.

## Store landscape — check for overlap
Root stores (`src/stores/`): `layoutStore`, `settingsStore`, `shortcutsStore`,
`sidebarStore`, `simplifiedNavigationStore`, `tabsStore`, `uiStore`.
Feature stores: `nota`, `blockStore`, `favoriteBlocksStore` (nota);
`aiActionsStore`, `aiConversationStore`, `aiSettingsStore` (ai);
`codeExecutionStore` (editor); plus auth and jupyter.

`layoutStore` / `sidebarStore` / `uiStore` / `simplifiedNavigationStore` are four
stores in the neighbourhood of "UI chrome state". Establish whether any two own
the same state, and what happens when they disagree. `simplifiedNavigationStore`
exists because of an unfinished migration — say whether it duplicates the others.

## Specific hunts
- **Cleanup.** Every `addEventListener`, `setInterval`, `setTimeout`,
  `ResizeObserver`, `MutationObserver`, `IntersectionObserver`, `new WebSocket`,
  and manual `watch` with `{ flush: 'sync' }` — does it have a matching
  `onUnmounted` / stop handle? Prefer `useEventListener` from `@vueuse/core`,
  which is already a dependency. Jupyter (`ws`) and file watching are the likely
  offenders.
- **Deep reactivity on documents.** A nota's block tree in a plain `ref`/`reactive`
  makes Vue walk the whole tree on every mutation. Look for where `shallowRef`,
  `shallowReactive`, or `markRaw` belongs — especially around the TipTap `Editor`
  instance itself, which must never be deeply reactive (`NotaEditor.vue`).
- **Watchers that should be computed**, and computed with side effects.
- **`watch` with `deep: true`** over large structures — each is a cost; is it
  needed?
- **Prop drilling / emit chains deeper than 2 levels**, especially in the
  settings tree (47 .vue files) and the pipeline block.
- **Composables that are not composables** — modules with `use` prefixes holding
  module-level singleton state that leaks between components.
- **`v-for` without a stable `:key`**, and long lists that would benefit from
  `v-memo` or virtualization (the nota list in `AppSidebar.vue`, 847 LOC).

## Hazards
- `components/ui/**` is shadcn-vue generated; it is excluded from lint on
  purpose. Do not file style findings against it. Do flag it if a generated
  component was hand-edited in a way that will break regeneration.
- Do not propose Options API or a state-library change.
