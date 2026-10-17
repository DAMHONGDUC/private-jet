# Remaining work (demo app)

Status as of commit `378eac6` on `feature/flight-booking`. Already done and pushed:
- BlackJet theme in light and dark, on every screen.
- Login with a mock user. The app is signed in by default; the demo account is `demo@blackjet.app` / `blackjet123`.
- Dashboard charter search: choose a jet per leg, quote detail, checkout, payment and confirmation.
- Shared-flight booking from the Flights tab.
- Trips: boarding-pass cards, trip detail and cancellation (free until 24 h before departure).
- Profile tab:
  - stats
  - personal information
  - payment cards: default, remove, and add with a flip preview
  - notification toggles
  - FAQ and legal pages
  - sign out
- Tab bar with the avatar and a spring indicator.
- Tests: 86 passing in 29 suites. `npx jest`, `npx eslint src __tests__` and `npx tsc --noEmit` are all clean.

## 1. Inbox: notifications, concierge chat, news detail

Create a new feature, `src/features/inbox`, using the same Clean Architecture layout as `booking`.

1. Domain (`domain/entities/inbox.ts`):
   - `AppNotification { id, kind: 'flight'|'offer'|'account'|'concierge', title, body, createdAt, read, bookingId? }`
   - `ChatMessage { id, author: 'member'|'concierge', text, sentAt, read }`
   - `InboxSummary { unreadMessages, unreadNotifications }`
   - `InboxRepository`:
     - `getNotifications`, `markNotificationRead(id)`, `markAllNotificationsRead`
     - `getMessages`, `sendMessage(text)` (returns the full thread, including the concierge reply), `markMessagesRead`
     - `getSummary`
2. Data: an `InboxMockDataSource(latencyMs, now)`.
   - Seed about 5 notifications relative to `now`. Include one flight notification with `bookingId: 'bk-seed-1'`, one empty-leg offer and one wallet top-up. Leave 2 unread.
   - Seed a concierge thread of about 4 messages, with the last 2 unread.
   - `sendMessage` waits `latencyMs * 2`, then adds a keyword-based reply:
     - catering → chef
     - pet → pets
     - cancel → cancellation
     - price / quote → quote
     - car → transfer
     - anything else → "Noted, I'll confirm within the hour".
3. Remove the old dashboard inbox pieces and update the dashboard-api test:
   - `getInbox` in `dashboard-api.ts`
   - `GetInbox`, `InboxDto`, `toInbox`, `buildMockInbox`
   - `DashboardRepository.getInbox`
4. Presentation (`inbox-api.ts`):
   - Add `'Notification' | 'Message' | 'Inbox'` to `tagTypes` in `src/core/store/base-api.ts`.
   - Endpoints: `getInboxSummary`, `getNotifications`, `markNotificationRead`, `markAllNotificationsRead`, `getMessages`, `sendMessage` and `markMessagesRead`.
   - Make `sendMessage` optimistic: in `onQueryStarted`, push the member message into the `getMessages` cache, then replace it with the returned thread.
   - Mark-read endpoints invalidate the `'Inbox'` tag.
5. `HomeAppBar` (`src/features/dashboard/presentation/components/HomeHeader.tsx`): switch it to `useGetInboxSummaryQuery`.
6. Screens:
   - `NotificationsScreen({ onOpenTrip })`:
     - grouped into Today and Earlier
     - unread dot
     - tapping marks the notification read, and opens the trip when it has a `bookingId`
     - "Mark all read" button
     - FadeInDown stagger
   - `ChatScreen`:
     - bubbles (member on the right in jet black, concierge on the left)
     - entering animation
     - typing indicator with 3 bouncing dots (`withRepeat` / `withSequence` / `withDelay`) while `sendMessage` is loading
     - quick-reply chips
     - input bar and send button
     - marks messages read on mount
   - `NewsDetailScreen({ newsId })`:
     - parallax hero (copy the pattern from `JetQuoteScreen`), title, summary and body
     - add `body` to `NewsPost` from a `'post-body'` field in `NewsPostDto` and `news.mock.ts`
7. Navigation:
   - Add `Chat`, `Notifications` and `NewsDetail: { newsId }` to `AppStackParamList` (`src/app/navigation/types.ts`).
   - Register them in `RootNavigator` next to `Main` when signed in, with `headerShown: true` and the themed header from `TripsNavigator`.
   - `HomeRoute` passes `onOpenMessages` / `onOpenNotifications` to `DashboardScreen`.
   - `NewsCarousel` taps open `NewsDetail`: add an `onPressItem(index)` prop to `PhotoPager`.
   - `TripDetailRoute` (TripsNavigator) and `HelpScreen` (ProfileNavigator) pass `onContactConcierge` → `navigate('Chat')`.
   - Notification → trip: `navigate('Main', { screen: 'TripsTab', params: { screen: 'TripDetail', params: { bookingId }, initial: false } })`.
8. Wire it into the DI container (`src/app/di/container.ts`) and add the new dependencies to the `AppDependencies` type.
9. Tests:
   - domain reply rules
   - inbox-api (optimistic send, badge counts after mark-read)
   - NotificationsScreen and ChatScreen
   - extend `__tests__/smoke.test.tsx` to open the chat from Home.

## 2. Polish and docs

- Optional: a shared-element-like transition from TripCard to TripDetail, using `FadeIn` on the header plus `LinearTransition`.
- `RefreshControl` on the Profile screen.
- Update `README.md` with:
  - a feature list
  - demo credentials
  - screenshots (iOS simulator, light and dark)
  - an architecture diagram
  - `npm run setup`
- Update `docs/setup.md` and add `feature-docs/` entries for profile, trips and inbox.
- Before each commit: `npx jest && npx eslint src __tests__ && npx tsc --noEmit`.
- Commit as `ducdam-dev` and push `feature/flight-booking`.

## 3. Repo hygiene (important)

- `black-jet-apk/` holds the original APK, which embeds real third-party API tokens. Remove it from the repo and from its history (`git filter-repo`), because the repo is public. Never reuse those keys.
