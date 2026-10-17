# BackJet

A private jet booking app: a dashboard, a flight search and a booking flow, on mock data.

| | |
|---|---|
| Stack | React Native 0.88 (New Architecture), Redux Toolkit, RTK Query, Reanimated 4, Clean Architecture |
| Navigation | React Navigation 7: bottom tabs + native stack |
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
- Slices hold UI state only (the flight search form and recent searches); server data lives in the RTK Query cache.

### Cache invalidation

| Mutation | Invalidates | Refetches |
|---|---|---|
| `bookFlight` | `Flight:<id>`, `Flight:LIST`, `Booking` | The flight's seats, the flight list, Trips, and the Dashboard (it provides `Booking` too) |

### Mock data

Mock data lives in each feature's data layer: `data/datasources/mock/*.mock.ts` builds DTOs dated from "now", and `*MockDataSource` serves them in memory with a fake network delay. Bookings and seat counts change in memory for the session. To use a real backend, write an HTTP data source with the same interface and swap it in `src/app/di/container.ts`; nothing above the data layer changes.

## Features

| Feature | Screens | Reanimated |
|---|---|---|
| Dashboard | Loyalty, stats, next trip, monthly spend | Collapsing header on scroll, tier progress fill, bars ease to height |
| Flights | Search card (from/to with swap, departure date, passengers, jet type in bottom sheets; recent searches), airport picker, results with jet filter, detail | Press-scale cards, plane flying the route |
| Booking | Form, confirmation, Trips | Success mark (disc, tick, one ring pulse); error message fades in |

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
