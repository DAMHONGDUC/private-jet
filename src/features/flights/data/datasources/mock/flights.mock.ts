import type { FlightDto } from '../../models/flight-dto';

type Airport = { iata: string; city: string; name: string };

const AIRPORTS = {
  HEL: { iata: 'HEL', city: 'Helsinki', name: 'Helsinki-Vantaa' },
  LBG: { iata: 'LBG', city: 'Paris', name: 'Paris-Le Bourget' },
  FAB: { iata: 'FAB', city: 'London', name: 'Farnborough' },
  NCE: { iata: 'NCE', city: 'Nice', name: "Nice Côte d'Azur" },
  GVA: { iata: 'GVA', city: 'Geneva', name: 'Geneva Cointrin' },
  DXB: { iata: 'DXB', city: 'Dubai', name: 'Dubai International' },
  OLB: { iata: 'OLB', city: 'Olbia', name: 'Olbia Costa Smeralda' },
} satisfies Record<string, Airport>;

type Seed = {
  id: string;
  operator: string;
  model: string;
  category: FlightDto['aircraft_category'];
  seats: number;
  from: keyof typeof AIRPORTS;
  to: keyof typeof AIRPORTS;
  /** Days after "today" and the local departure hour. */
  day: number;
  hour: number;
  minutes: number;
  priceEur: number;
  seatsLeft: number;
  amenities: string[];
};

const SEEDS: Seed[] = [
  { id: 'BJ-101', operator: 'Nordic Wings', model: 'Cessna Citation CJ4', category: 'light', seats: 7, from: 'HEL', to: 'LBG', day: 1, hour: 9, minutes: 185, priceEur: 2900, seatsLeft: 5, amenities: ['Wi-Fi', 'Catering'] },
  { id: 'BJ-102', operator: 'Aurora Jets', model: 'Embraer Phenom 300E', category: 'light', seats: 8, from: 'HEL', to: 'GVA', day: 2, hour: 14, minutes: 195, priceEur: 3100, seatsLeft: 2, amenities: ['Wi-Fi', 'Lavatory'] },
  { id: 'BJ-103', operator: 'Skyline Private', model: 'Bombardier Challenger 350', category: 'midsize', seats: 10, from: 'FAB', to: 'NCE', day: 2, hour: 11, minutes: 120, priceEur: 4200, seatsLeft: 6, amenities: ['Wi-Fi', 'Catering', 'Flat beds'] },
  { id: 'BJ-104', operator: 'Nordic Wings', model: 'Gulfstream G280', category: 'midsize', seats: 9, from: 'LBG', to: 'OLB', day: 3, hour: 8, minutes: 130, priceEur: 3900, seatsLeft: 0, amenities: ['Wi-Fi', 'Catering'] },
  { id: 'BJ-105', operator: 'Aurora Jets', model: 'Gulfstream G650ER', category: 'heavy', seats: 14, from: 'GVA', to: 'DXB', day: 4, hour: 22, minutes: 375, priceEur: 9800, seatsLeft: 9, amenities: ['Wi-Fi', 'Chef', 'Flat beds', 'Shower'] },
  { id: 'BJ-106', operator: 'Skyline Private', model: 'Dassault Falcon 8X', category: 'heavy', seats: 12, from: 'FAB', to: 'DXB', day: 5, hour: 7, minutes: 400, priceEur: 10400, seatsLeft: 4, amenities: ['Wi-Fi', 'Chef', 'Flat beds'] },
  { id: 'BJ-107', operator: 'Aurora Jets', model: 'Pilatus PC-24', category: 'light', seats: 6, from: 'NCE', to: 'GVA', day: 6, hour: 16, minutes: 55, priceEur: 1900, seatsLeft: 6, amenities: ['Catering'] },
  { id: 'BJ-108', operator: 'Nordic Wings', model: 'Bombardier Global 7500', category: 'heavy', seats: 16, from: 'HEL', to: 'DXB', day: 8, hour: 10, minutes: 390, priceEur: 11900, seatsLeft: 12, amenities: ['Wi-Fi', 'Chef', 'Flat beds', 'Shower'] },
];

function at(now: Date, day: number, hour: number): Date {
  const date = new Date(now);
  date.setDate(date.getDate() + day);
  date.setHours(hour, 0, 0, 0);
  return date;
}

/** Flights dated from `now`, so the mock always shows upcoming departures. */
export function buildMockFlights(now: Date): FlightDto[] {
  return SEEDS.map(seed => {
    const from = AIRPORTS[seed.from];
    const to = AIRPORTS[seed.to];
    const departure = at(now, seed.day, seed.hour);
    const arrival = new Date(departure.getTime() + seed.minutes * 60_000);

    return {
      id: seed.id,
      operator_name: seed.operator,
      aircraft_model: seed.model,
      aircraft_category: seed.category,
      aircraft_seats: seed.seats,
      origin_iata: from.iata,
      origin_city: from.city,
      origin_airport: from.name,
      destination_iata: to.iata,
      destination_city: to.city,
      destination_airport: to.name,
      departure_time: departure.toISOString(),
      arrival_time: arrival.toISOString(),
      price_per_seat_cents: seed.priceEur * 100,
      currency: 'EUR',
      seats_left: seed.seatsLeft,
      amenities: seed.amenities,
    };
  });
}
