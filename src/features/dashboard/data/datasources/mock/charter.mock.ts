import { JetCategory } from '@/features/flights/domain/entities/flight';
import type { JetQuoteDto } from '../../models/jet-quote-dto';
import type { QuoteQuery } from '../charter-data-source';

/** Where the mock flights' airports are, for great-circle distances. */
const COORDINATES: Record<string, { lat: number; lon: number }> = {
  PER: { lat: -31.9403, lon: 115.9669 },
  OOL: { lat: -28.1644, lon: 153.5047 },
  BNE: { lat: -27.3842, lon: 153.1175 },
  MEB: { lat: -37.7281, lon: 144.9019 },
  SYD: { lat: -33.9399, lon: 151.1753 },
  SIN: { lat: 1.3644, lon: 103.9915 },
  HTI: { lat: -20.3581, lon: 148.9519 },
};

type Jet = {
  model: string;
  category: JetQuoteDto['aircraft_class'];
  seats: number;
  cruiseKmh: number;
  rangeKm: number;
  hourlyAud: number;
  baggageM3: number;
  cabin: string;
  amenities: string[];
  photos: string[];
};

const FLEET: Jet[] = [
  {
    model: 'Pilatus PC-24',
    category: JetCategory.Light,
    seats: 6,
    cruiseKmh: 790,
    rangeKm: 3300,
    hourlyAud: 7900,
    baggageM3: 2.5,
    cabin: 'Flat-floor cabin · 1.55 m',
    amenities: ['Wi-Fi', 'Refreshment centre', 'Private lavatory'],
    photos: ['jet-1', 'jet-3'],
  },
  {
    model: 'Embraer Phenom 300E',
    category: JetCategory.Light,
    seats: 7,
    cruiseKmh: 830,
    rangeKm: 3600,
    hourlyAud: 8600,
    baggageM3: 2.2,
    cabin: 'Oval cabin · 1.50 m',
    amenities: ['Wi-Fi', 'Catering', 'Private lavatory'],
    photos: ['jet-3', 'jet-2'],
  },
  {
    model: 'Bombardier Challenger 350',
    category: JetCategory.Midsize,
    seats: 9,
    cruiseKmh: 850,
    rangeKm: 5900,
    hourlyAud: 13000,
    baggageM3: 3.0,
    cabin: 'Stand-up cabin · 1.83 m',
    amenities: ['Wi-Fi', 'Hot catering', 'Flight attendant', 'Lie-flat seats'],
    photos: ['jet-2', 'jet-4'],
  },
  {
    model: 'Gulfstream G280',
    category: JetCategory.Midsize,
    seats: 9,
    cruiseKmh: 860,
    rangeKm: 6600,
    hourlyAud: 13900,
    baggageM3: 4.0,
    cabin: 'Stand-up cabin · 1.85 m',
    amenities: ['Wi-Fi', 'Hot catering', 'Flight attendant', 'Lie-flat seats'],
    photos: ['jet-4', 'jet-1'],
  },
  {
    model: 'Dassault Falcon 8X',
    category: JetCategory.Heavy,
    seats: 14,
    cruiseKmh: 880,
    rangeKm: 11900,
    hourlyAud: 20600,
    baggageM3: 3.8,
    cabin: 'Three-zone cabin · 1.88 m',
    amenities: [
      'Wi-Fi',
      'Chef on board',
      'Flight attendant',
      'Bedroom',
      'Shower',
    ],
    photos: ['jet-4', 'jet-2', 'jet-3'],
  },
  {
    model: 'Gulfstream G650ER',
    category: JetCategory.Heavy,
    seats: 16,
    cruiseKmh: 900,
    rangeKm: 13900,
    hourlyAud: 23900,
    baggageM3: 5.4,
    cabin: 'Four-zone cabin · 1.91 m',
    amenities: [
      'Wi-Fi',
      'Chef on board',
      'Flight attendant',
      'Bedroom',
      'Shower',
    ],
    photos: ['jet-2', 'jet-1', 'jet-4'],
  },
];

const TAXI_MINUTES = 20;
const FUEL_STOP_MINUTES = 45;

function distanceKm(from: string, to: string): number | undefined {
  const a = COORDINATES[from];
  const b = COORDINATES[to];
  if (!a || !b) {
    return undefined;
  }
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const h =
    Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(rad(a.lat)) *
      Math.cos(rad(b.lat)) *
      Math.sin(rad(b.lon - a.lon) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** Every jet with room for the party, timed and priced for the leg; none for an unknown airport. */
export function buildMockQuotes({
  origin,
  destination,
  date,
  passengers,
}: QuoteQuery): JetQuoteDto[] {
  const km = distanceKm(origin, destination);
  if (km === undefined) {
    return [];
  }
  return FLEET.filter(jet => jet.seats >= passengers).map(jet => {
    const nonStop = jet.rangeKm >= km;
    const minutes = Math.round(
      TAXI_MINUTES +
        (km / jet.cruiseKmh) * 60 +
        (nonStop ? 0 : FUEL_STOP_MINUTES),
    );
    const priceAud = Math.ceil((jet.hourlyAud * minutes) / 60 / 100) * 100;
    return {
      quote_id: `${origin}-${destination}-${date}-${jet.model
        .replace(/\W+/g, '')
        .toLowerCase()}`,
      aircraft_model: jet.model,
      aircraft_class: jet.category,
      aircraft_seats: jet.seats,
      cruise_kmh: jet.cruiseKmh,
      range_km: jet.rangeKm,
      baggage_m3: jet.baggageM3,
      cabin: jet.cabin,
      amenities: [...jet.amenities],
      photo_keys: [...jet.photos],
      non_stop: nonStop,
      flight_minutes: minutes,
      price_cents: priceAud * 100,
      currency: 'AUD',
    };
  });
}
