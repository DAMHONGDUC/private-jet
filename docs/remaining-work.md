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
- Screenshots: 12 screens in light and dark, in `docs/screenshots/` (iPhone 17 Pro Max simulator, 660 × 1434). The README shows the demo video in `docs/demo/` instead.
- Trip detail polish: the header fades in, sections slide into place with `LinearTransition` when a trip is cancelled, the status pill cross-fades, and the Trips list reflows with `itemLayoutAnimation`.
- Fixes found while taking the screenshots:
  - photos in jet cards, the jet quote, the news carousel and the full story were drawn at their pixel size (only absolute insets), leaving a dark strip or a zoomed crop; they are now sized explicitly
  - `npm run setup` forces a UTF-8 locale for `pod install`, which crashed with an encoding error otherwise
- Checks: `npx jest` (94 tests), `npx eslint src __tests__` and `npx tsc --noEmit` all clean.

## Still to do
1. **Repo hygiene (important)**
   - Done on 2026-10-17: the APK is gone from the history of `feature/flight-booking` (`git filter-repo --path black-jet-apk --invert-paths`, limited to the commits after `a13c64b`), force-pushed with a lease. `main` never had it.
   - Still to do by the owner:
     - **Rotate the third-party API tokens** that were in the APK; the old history was public, so treat them as leaked.
     - Ask GitHub Support to purge the old commits (`0853952` … `57088cd`): GitHub keeps them reachable by SHA, and the PR #1 merge ref still pointed at them right after the push.
     - Any other clone of the repo (other machines, collaborators) must re-clone or `git reset --hard origin/feature/flight-booking`.
   - The rewrite dropped the SSH signatures of the 29 commits after the APK; the earlier commits keep theirs.
2. **Optional:** the jet photos have rounded black corners baked into the files (`src/assets/images/jet-*.jpg`); clean, square-cornered photos would look better in the cards. `jet-1.jpg` also shows a HondaJet, not a Pilatus PC-24.

## How to work
- Before each commit: `npx jest && npx eslint src __tests__ && npx tsc --noEmit`.
- Commit as `ducdam-dev`, then `git push origin feature/flight-booking`.
