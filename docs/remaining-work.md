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
- Tab bar with the avatar and a spring indicator; pull to refresh on Profile.
- Docs:
  - `README.md`: demo account, demo script, features, cache table
  - `docs/setup.md`
  - `feature-docs/app/README.md`: navigation, session, booking model, seeds, inbox, motion
- Checks: `npx jest` (94 tests), `npx eslint src __tests__` and `npx tsc --noEmit` all clean.

## Still to do
1. **Screenshots** for the README and the Upwork listing. Take them on a device or simulator, which this repo's CI cannot do:
   - Home
   - jet quote
   - checkout
   - Trips
   - chat
   - Profile
   - add card
   - each in light and dark
2. **Optional polish:** a smoother TripCard → TripDetail transition, using `FadeIn` on the header plus `LinearTransition`.
3. **Repo hygiene (important)**
   - The original APK, which embeds real third-party API tokens, is gone from the tip of the branch, and `.gitignore` now blocks `*.apk` / `*.aab`.
   - It is still in the **git history**, and the repo is public. Rewrite the history to remove it, then force push:
     - `git filter-repo --path black-jet-apk --invert-paths`
     - `git push --force-with-lease`
   - Do this on every branch that has the file, and ask collaborators to re-clone.
   - Never reuse those keys.

## How to work
- Before each commit: `npx jest && npx eslint src __tests__ && npx tsc --noEmit`.
- Commit as `ducdam-dev`, then `git push origin feature/flight-booking`.
