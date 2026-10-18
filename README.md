# BackJet

A private jet booking app built as a client demo. It covers:
- charters (the whole aircraft on any route)
- trips with cancellation
- payment cards and a wallet
- a concierge chat and notifications
- a member profile

Everything runs on in-memory mock data, so the app works offline with no backend.

## App identity

| | |
|---|---|
| Bundle id (iOS and Android) | `app.dd.private.jet` |
| Display name | BackJet |
| App icon | [src/assets/images/app-icon.png](src/assets/images/app-icon.png), 1024 × 1024, the source of every launcher icon |
| Launch screen | The app icon centred on `#0B0B0C`: `ios/BackJet/LaunchScreen.storyboard`, and the `AppTheme.Launch` theme on Android (the system splash API on Android 12+) |

The Android Kotlin package stays `com.backjet` (`namespace` in `android/app/build.gradle`); only the `applicationId` is `app.dd.private.jet`.

## Screenshots

iPhone 17 Pro Max simulator. Full set, including the news story and payment cards: [docs/screenshots](docs/screenshots).

| | Home | Jets | Jet quote | Checkout | Booked |
|---|---|---|---|---|---|
| Light | <img src="docs/screenshots/home-light.png" width="160"> | <img src="docs/screenshots/results-light.png" width="160"> | <img src="docs/screenshots/quote-light.png" width="160"> | <img src="docs/screenshots/checkout-light.png" width="160"> | <img src="docs/screenshots/confirmation-light.png" width="160"> |
| Dark | <img src="docs/screenshots/home-dark.png" width="160"> | <img src="docs/screenshots/results-dark.png" width="160"> | <img src="docs/screenshots/quote-dark.png" width="160"> | <img src="docs/screenshots/checkout-dark.png" width="160"> | <img src="docs/screenshots/confirmation-dark.png" width="160"> |

| | Trips | Trip | Concierge | Profile | Add card |
|---|---|---|---|---|---|
| Light | <img src="docs/screenshots/trips-light.png" width="160"> | <img src="docs/screenshots/trip-detail-light.png" width="160"> | <img src="docs/screenshots/chat-light.png" width="160"> | <img src="docs/screenshots/profile-light.png" width="160"> | <img src="docs/screenshots/add-card-light.png" width="160"> |
| Dark | <img src="docs/screenshots/trips-dark.png" width="160"> | <img src="docs/screenshots/trip-detail-dark.png" width="160"> | <img src="docs/screenshots/chat-dark.png" width="160"> | <img src="docs/screenshots/profile-dark.png" width="160"> | <img src="docs/screenshots/add-card-dark.png" width="160"> |

## Demo account

The app opens already signed in as **Alexander Reed** (Black Card). After signing out, the login screen offers:
- **Continue with Demo Account**
- Apple and Google buttons, which also sign in to the demo account
- the form with `demo@blackjet.app` / `blackjet123`

## What to show in a demo

1. **Home.** Search a round trip (for example GVA → NCE, 2 passengers), or tap a popular route to fill the airports.
   - Scrolling down turns the form into a floating pill; dragging back up brings the whole form back.
   - The jets open on their own screen. Open a jet and choose it for both legs; the selection bar shows the total.
2. **Checkout.** Pick departure times and the party, then pay with a card or the wallet.
   - The confirmation draws a success mark.
   - **View trip** opens it in Trips.
3. **Trips.** Upcoming and past trips as boarding passes.
   - A trip more than 24 h away can be cancelled.
4. **Inbox** (chat and bell on Home).
   - The concierge chat answers by topic: try "catering", "dog" or "car".
   - In notifications, a crew update opens its trip.
   - Tap a news story for the full article.
5. **Profile.** Edit personal information, add a card (it turns over while the security code is typed), set the default, toggle notifications, read the FAQ, sign out.

| | |
|---|---|
| Stack | React Native 0.88 (New Architecture), Redux Toolkit, RTK Query, Reanimated 4, Clean Architecture |
| Navigation | React Navigation 7: native bottom tabs (Liquid Glass on iOS 26) + native stack |
| Tests | Jest + React Native Testing Library 14 |

## Commands

| Task | Command |
|---|---|
| Setup | `npm run setup` |
| Run | `npm run android` / `npm run ios` |
| Checks | `npm run lint && npm run typecheck && npm test` |
| Full run guide | [docs/setup.md](docs/setup.md) |

## Architecture

Feature-first Clean Architecture. Each feature has three layers; dependencies point inward.

```mermaid
flowchart LR
  subgraph presentation
    Screen -->|hook| API[RTK Query endpoint]
    Screen -->|useSelector| Slice[Redux slice: UI state]
  end
  subgraph domain
    UseCase[Use case] --> RepoI[Repository interface]
  end
  subgraph data
    RepoImpl[Repository impl] --> DS[Data source: mock]
    RepoImpl --> Mapper[DTO → entity mapper]
  end
  API -->|queryFn| UseCase
  RepoImpl -. implements .-> RepoI
```

| Layer | Holds | Knows Redux / React? |
|---|---|---|
| `domain/` | Entities, repository interfaces, use cases, business rules | No |
| `data/` | DTOs, mappers, data sources (mock today), repository implementations | No |
| `presentation/` | RTK Query endpoints, slices, screens, components | Yes |
| `src/app/` | Composition root (`di/container.ts`), store, navigation | Yes |

### How RTK Query fits

- One `createApi` with `fakeBaseQuery` (`src/core/store/base-api.ts`): no endpoint calls HTTP itself.
- Every endpoint's `queryFn` calls a use case, which it receives as the thunk `extra` (`createAppStore` injects the use cases).
- RTK Query still owns caching, request de-duplication, tags, refetching and the `useXxxQuery` / `useXxxMutation` hooks.
- Errors thrown below are mapped to a serializable `AppError` by `runQuery` (`src/core/query/run-query.ts`).
- Slices hold UI state only (the flight and charter search forms, recent searches and airports); server data lives in the RTK Query cache.

### Cache invalidation

| Mutation | Invalidates | Refetches |
|---|---|---|
| `bookFlight` | `Flight:<id>`, `Flight:LIST`, `Booking`, `Payment:LIST` | The flight's seats, the flight list, Trips and the wallet balance |
| `bookCharter` | `Booking`, `Payment:LIST` | Trips and the wallet balance |
| `cancelBooking` | `Booking:<id>`, `Booking` | The trip and Trips |
| `addCard`, `setDefaultPayment`, `removeCard` | `Payment:LIST` | Payment methods everywhere |
| `markNotificationRead`, `markMessagesRead` | `Notification`, `Message` | The lists and the home badges (marking read is optimistic) |
| `sendMessage` | none | Optimistic: the member's bubble shows at once, then the thread with the reply replaces the cache |
| `signIn`, `signOut`, `updateProfile` | none | The session slice follows them through matchers |

### Mock data

Mock data lives in each feature's data layer: `data/datasources/mock/*.mock.ts` builds DTOs dated from "now", and `*MockDataSource` serves them in memory with a fake network delay. Bookings and seat counts change in memory for the session. To use a real backend, write an HTTP data source with the same interface and swap it in `src/app/di/container.ts`; nothing above the data layer changes.

## Features

More detail per screen: [feature-docs/app/README.md](feature-docs/app/README.md).

| Feature | Screens | Animation |
|---|---|---|
| Auth | Splash, login (form, demo account, Apple/Google) | Form shakes on error, fade between signed-in and signed-out stacks |
| Dashboard | Charter search (one-way, round-trip, multi-city), popular routes, news carousel and full story; search results, jet quote and charter checkout on their own screens ([spec](feature-docs/dashboard/README.md)) | Search form turns into a floating pill on scroll; parallax photo headers; shimmer skeletons; Lottie empty state |
| Booking | Trips (upcoming/past), trip detail with cancellation, confirmation, payment picker | Segmented control slides, success mark |
| Inbox | Notifications, concierge chat | Unread dots fade out, typing dots |
| Profile | Profile with stats, personal information, payment cards, add card, help/FAQ, terms | Card flips while the CVC is typed, FAQ accordion |

## Folder layout

```
src/
  app/            App.tsx, di/container.ts, store/, navigation/
  core/           error/, query/, store/base-api.ts, theme/, ui/, utils/
  features/
    <feature>/
      domain/       entities/, repositories/, usecases/
      data/         datasources/ (+ mock/), models/, mappers/, repositories/
      presentation/ <feature>-api.ts, slices, screens/, components/
__tests__/        same tree as src/ (core/, features/<feature>/...), plus smoke.test.tsx
  test-utils/     test store with zero latency and a fixed clock (import as @test-utils/...)
```

Screens take callbacks (`onOpenFlight`, `onBooked`) instead of a navigation prop; `src/app/navigation` adapts routes to them.

Every screen uses the BlackJet look from `src/core/theme/blackjet.ts`:
- light and dark palettes that follow the system, through `useBlackJetTheme()`
- `makeStyles()` for themed style sheets
- KnulTrial and the icon fonts from `src/assets/fonts`

`src/core/theme/theme.ts` holds only spacing, radii and press timing.

## Remaining work

See [docs/remaining-work.md](docs/remaining-work.md).
