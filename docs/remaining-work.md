# Remaining work (demo app)

Branch `feature/flight-booking`. Update this file with every commit, so whoever picks the work up knows where it stands.

## Done and pushed
- BlackJet theme in light and dark on every screen.
- Login with a mock user. The app is signed in by default; the demo account is `demo@blackjet.app` / `blackjet123`.
- Home (dashboard):
  - charter search: choose a jet per leg, quote detail, checkout with payment, confirmation
  - news carousel; each story opens in full
- Flights tab: shared-flight seat booking.
- Trips: boarding-pass cards, trip detail, cancellation (free until 24 h before departure), message the concierge.
- Profile tab:
  - stats
  - personal information
  - payment cards: default, remove, and add with a flip preview
  - notification toggles
  - FAQ and legal pages
  - sign out
- Inbox, opened from the home app bar badges:
  - notifications: today / earlier, unread dots, mark all read; a notification about a trip opens it
  - concierge chat: quick replies, typing indicator, replies matched to the topic
- Tab bar with the avatar and a spring indicator.
- Checks: `npx jest` (94 tests), `npx eslint src __tests__` and `npx tsc --noEmit` all clean.

## Still to do
1. **Polish**
   - `RefreshControl` on the Profile screen.
   - Optional: a smoother TripCard → TripDetail transition, using `FadeIn` on the header plus `LinearTransition`.
2. **Docs**
   - `README.md`:
     - feature list
     - demo credentials
     - screenshots (iOS simulator, light and dark)
     - architecture overview
     - `npm run setup`
   - `docs/setup.md`.
   - `feature-docs/` entries for profile, trips and inbox.
3. **Repo hygiene (important)**
   - `black-jet-apk/` holds the original APK, which embeds real third-party API tokens. Remove it from the repo, and from its history with `git filter-repo` plus a force push, because the repo is public.
   - Never reuse those keys.

## How to work
- Before each commit: `npx jest && npx eslint src __tests__ && npx tsc --noEmit`.
- Commit as `ducdam-dev`, then `git push origin feature/flight-booking`.
