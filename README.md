# Sovereign: Private Jet

## Overview

A private jet charter app for iOS and Android: search a route, compare jets, book in seconds, and let a personal concierge handle the rest. It runs on in-memory mock data, so it works offline with no backend.

<img src="docs/marketing/sovereign-wallpaper-1000x750.png" width="600" alt="Sovereign: Private Jet">

<a href="https://www.youtube.com/watch?v=AiZxhg_jcxw"><img src="docs/marketing/sovereign-youtube-1280x720.png" width="600" alt="Sovereign product film, tap to play"></a>

- Product film (52 s): [watch on YouTube](https://www.youtube.com/watch?v=AiZxhg_jcxw), or the 1920×1080 file [docs/demo/sovereign-film.mp4](docs/demo/sovereign-film.mp4)
- Marketing images: [docs/marketing](docs/marketing) (wallpaper 1000×750, YouTube 1280×720, square 1024×1024)

## Tech Stack

| | |
|---|---|
| App | React Native 0.88 (New Architecture), TypeScript |
| State and data | Redux Toolkit, RTK Query |
| Navigation | React Navigation 7: native bottom tabs (Liquid Glass on iOS 26) and native stack |
| Animation | Reanimated 4, Lottie |
| Architecture | Feature-first Clean Architecture: domain, data, presentation |
| Tests | Jest, React Native Testing Library |

Setup and run: [docs/setup.md](docs/setup.md).

## Features

- **Charter search:** one way, return and multi-city. Switching trip type keeps what you entered.
- **Popular routes:** one tap opens the available jets.
- **Jets and quotes:** photos, cabin, range and price, with estimated departure and landing in local time.
- **Checkout:** departure time, guests, special requests, and payment by card or wallet.
- **Trips:** upcoming and past trips, trip detail with estimated times, and cancellation.
- **Concierge chat** and notifications.
- **Profile:** personal information, payment cards and wallet, notification settings, help.
- **Light and dark mode**, in English and Vietnamese.

## App Screenshots

| Home | Jets | Quote | Checkout | Booked |
|---|---|---|---|---|
| <img src="docs/screenshots/home.png" width="160"> | <img src="docs/screenshots/results.png" width="160"> | <img src="docs/screenshots/quote.png" width="160"> | <img src="docs/screenshots/checkout.png" width="160"> | <img src="docs/screenshots/confirmation.png" width="160"> |

| Trips | Trip | Concierge | Profile | Cards |
|---|---|---|---|---|
| <img src="docs/screenshots/trips.png" width="160"> | <img src="docs/screenshots/trip-detail.png" width="160"> | <img src="docs/screenshots/concierge.png" width="160"> | <img src="docs/screenshots/profile.png" width="160"> | <img src="docs/screenshots/payment-cards.png" width="160"> |
