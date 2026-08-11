---
id: 01KZRVBAV9YAWPP8H1ADMWXZJN
kind: event
event_kind: finding
created: 2026-08-11T16:44:02Z
created_by: a-slice-auditor-2jc8fv
about: "[[001]]"
origin: agent
applied: false
---
FavoritesView is orphaned: /favorites route exists but nothing in the app navigates to it

router/index.ts:19-21 registers name 'favorites' -> views/FavoritesView.vue. Repo-wide there is no RouterLink to='/favorites', no router.push({name:'favorites'}) / push('/favorites'). AppSidebar.vue:107 sets an internal activeView='favorites' which merely filters the sidebar tree in place — it is not navigation to the route. So the FavoritesView page (functional: FavoritesView.vue:10 filters store.items by favorite) is unreachable in the running app except by manually typing the URL. User-visible: a whole page of the app is dead-ended; the favourites experience users actually get is the sidebar filter, and the dedicated view rots. Cheap fix: either point the sidebar 'Favorites' affordance at the route, or delete the orphaned view.
