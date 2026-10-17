import type { JetQuoteDto } from '../../models/jet-quote-dto';
import type { QuoteQuery } from '../charter-data-source';

/** Where the mock flights' airports are, for great-circle distances. */
const COORDINATES: Record<string, { lat: number; lon: number }> = {
  HEL: { lat: 60.3172, lon: 24.9633 },
  LBG: { lat: 48.9694, lon: 2.4414 },
  FAB: { lat: 51.2758, lon: -0.7763 },
  NCE: { lat: 43.6584, lon: 7.2159 },
  GVA: { lat: 46.2381, lon: 6.109 },
  DXB: { lat: 25.2532, lon: 55.3657 },
  OLB: { lat: 40.8987, lon: 9.5176 },
};

type Jet = {
  model: string;
  category: JetQuoteDto['aircraft_class'];
  seats: number;
  cruiseKmh: number;
  rangeKm: number;
  hourlyEur: number;
  baggageM3: number;
  cabin: string;
  amenities: string[];
  photos: string[];
};

const FLEET: Jet[] = [
  { model: 'Pilatus PC-24', category: 'light', seats: 6, cruiseKmh: 790, rangeKm: 3300, hourlyEur: 4800, baggageM3: 2.5, cabin: 'Flat-floor cabin · 1.55 m', amenities: ['Wi-Fi', 'Refreshment centre', 'Private lavatory'], photos: ['jet-1', 'jet-3'] },
  { model: 'Embraer Phenom 300E', category: 'light', seats: 7, cruiseKmh: 830, rangeKm: 3600, hourlyEur: 5200, baggageM3: 2.2, cabin: 'Oval cabin · 1.50 m', amenities: ['Wi-Fi', 'Catering', 'Private lavatory'], photos: ['jet-3', 'jet-2'] },
  { model: 'Bombardier Challenger 350', category: 'midsize', seats: 9, cruiseKmh: 850, rangeKm: 5900, hourlyEur: 7900, baggageM3: 3.0, cabin: 'Stand-up cabin · 1.83 m', amenities: ['Wi-Fi', 'Hot catering', 'Flight attendant', 'Lie-flat seats'], photos: ['jet-2', 'jet-4'] },
  { model: 'Gulfstream G280', category: 'midsize', seats: 9, cruiseKmh: 860, rangeKm: 6600, hourlyEur: 8400, baggageM3: 4.0, cabin: 'Stand-up cabin · 1.85 m', amenities: ['Wi-Fi', 'Hot catering', 'Flight attendant', 'Lie-flat seats'], photos: ['jet-4', 'jet-1'] },
  { model: 'Dassault Falcon 8X', category: 'heavy', seats: 14, cruiseKmh: 880, rangeKm: 11900, hourlyEur: 12500, baggageM3: 3.8, cabin: 'Three-zone cabin · 1.88 m', amenities: ['Wi-Fi', 'Chef on board', 'Flight attendant', 'Bedroom', 'Shower'], photos: ['jet-4', 'jet-2', 'jet-3'] },
  { model: 'Gulfstream G650ER', category: 'heavy', seats: 16, cruiseKmh: 900, rangeKm: 13900, hourlyEur: 14500, baggageM3: 5.4, cabin: 'Four-zone cabin · 1.91 m', amenities: ['Wi-Fi', 'Chef on board', 'Flight attendant', 'Bedroom', 'Shower'], photos: ['jet-2', 'jet-1', 'jet-4'] },
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
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lon - a.lon) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** Every jet with room for the party, timed and priced for the leg; none for an unknown airport. */
export function buildMockQuotes({ origin, destination, date, passengers }: QuoteQuery): JetQuoteDto[] {
  const km = distanceKm(origin, destination);
  if (km === undefined) {
    return [];
  }
  return FLEET.filter(jet => jet.seats >= passengers).map(jet => {
    const nonStop = jet.rangeKm >= km;
    const minutes = Math.round(TAXI_MINUTES + (km / jet.cruiseKmh) * 60 + (nonStop ? 0 : FUEL_STOP_MINUTES));
    const priceEur = Math.ceil(((jet.hourlyEur * minutes) / 60) / 100) * 100;
    return {
      quote_id: `${origin}-${destination}-${date}-${jet.model.replace(/\W+/g, '').toLowerCase()}`,
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
      price_cents: priceEur * 100,
      currency: 'EUR',
    };
  });
}
