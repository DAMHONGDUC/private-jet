import { JetCategory } from '../../../domain/entities/flight';
import type { AirportDto } from '../../models/airport-dto';
import type { FlightDto } from '../../models/flight-dto';

const AIRPORTS = {
  PER: { iata: 'PER', city: 'Perth', name: 'Perth Airport' },
  OOL: { iata: 'OOL', city: 'Gold Coast', name: 'Gold Coast Airport' },
  BNE: { iata: 'BNE', city: 'Brisbane', name: 'Brisbane Airport' },
  MEB: { iata: 'MEB', city: 'Melbourne', name: 'Essendon Fields' },
  SYD: { iata: 'SYD', city: 'Sydney', name: 'Sydney Kingsford Smith' },
  SIN: { iata: 'SIN', city: 'Singapore', name: 'Singapore Changi' },
  HTI: {
    iata: 'HTI',
    city: 'Hamilton Island',
    name: 'Hamilton Island Airport',
  },
  ADL: { iata: 'ADL', city: 'Adelaide', name: 'Adelaide Airport' },
  CBR: { iata: 'CBR', city: 'Canberra', name: 'Canberra Airport' },
  CNS: { iata: 'CNS', city: 'Cairns', name: 'Cairns Airport' },
  HBA: { iata: 'HBA', city: 'Hobart', name: 'Hobart Airport' },
  DRW: { iata: 'DRW', city: 'Darwin', name: 'Darwin International' },
  AYQ: { iata: 'AYQ', city: 'Uluru', name: 'Ayers Rock Airport' },
  BME: { iata: 'BME', city: 'Broome', name: 'Broome International' },
  AKL: { iata: 'AKL', city: 'Auckland', name: 'Auckland Airport' },
  ZQN: { iata: 'ZQN', city: 'Queenstown', name: 'Queenstown Airport' },
  DPS: { iata: 'DPS', city: 'Bali', name: 'Ngurah Rai International' },
  NAN: { iata: 'NAN', city: 'Fiji', name: 'Nadi International' },
  HKG: { iata: 'HKG', city: 'Hong Kong', name: 'Hong Kong International' },
  HND: { iata: 'HND', city: 'Tokyo', name: 'Tokyo Haneda' },
} satisfies Record<string, AirportDto>;

export function buildMockAirports(): AirportDto[] {
  return Object.values(AIRPORTS).map(airport => ({ ...airport }));
}

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
  priceAud: number;
  seatsLeft: number;
  amenities: string[];
};

const SEEDS: Seed[] = [
  {
    id: 'BJ-101',
    operator: 'Southern Cross Aviation',
    model: 'Cessna Citation CJ4',
    category: JetCategory.Light,
    seats: 7,
    from: 'PER',
    to: 'OOL',
    day: 1,
    hour: 9,
    minutes: 185,
    priceAud: 4800,
    seatsLeft: 5,
    amenities: ['Wi-Fi', 'Catering'],
  },
  {
    id: 'BJ-102',
    operator: 'Coral Sea Jets',
    model: 'Embraer Phenom 300E',
    category: JetCategory.Light,
    seats: 8,
    from: 'PER',
    to: 'SYD',
    day: 2,
    hour: 14,
    minutes: 195,
    priceAud: 5100,
    seatsLeft: 2,
    amenities: ['Wi-Fi', 'Lavatory'],
  },
  {
    id: 'BJ-103',
    operator: 'Harbour Air Charter',
    model: 'Bombardier Challenger 350',
    category: JetCategory.Midsize,
    seats: 10,
    from: 'BNE',
    to: 'MEB',
    day: 2,
    hour: 11,
    minutes: 120,
    priceAud: 6900,
    seatsLeft: 6,
    amenities: ['Wi-Fi', 'Catering', 'Flat beds'],
  },
  {
    id: 'BJ-104',
    operator: 'Southern Cross Aviation',
    model: 'Gulfstream G280',
    category: JetCategory.Midsize,
    seats: 9,
    from: 'OOL',
    to: 'HTI',
    day: 3,
    hour: 8,
    minutes: 130,
    priceAud: 6400,
    seatsLeft: 0,
    amenities: ['Wi-Fi', 'Catering'],
  },
  {
    id: 'BJ-105',
    operator: 'Coral Sea Jets',
    model: 'Gulfstream G650ER',
    category: JetCategory.Heavy,
    seats: 14,
    from: 'SYD',
    to: 'SIN',
    day: 4,
    hour: 22,
    minutes: 375,
    priceAud: 16200,
    seatsLeft: 9,
    amenities: ['Wi-Fi', 'Chef', 'Flat beds', 'Shower'],
  },
  {
    id: 'BJ-106',
    operator: 'Harbour Air Charter',
    model: 'Dassault Falcon 8X',
    category: JetCategory.Heavy,
    seats: 12,
    from: 'BNE',
    to: 'SIN',
    day: 5,
    hour: 7,
    minutes: 400,
    priceAud: 17200,
    seatsLeft: 4,
    amenities: ['Wi-Fi', 'Chef', 'Flat beds'],
  },
  {
    id: 'BJ-107',
    operator: 'Coral Sea Jets',
    model: 'Pilatus PC-24',
    category: JetCategory.Light,
    seats: 6,
    from: 'MEB',
    to: 'SYD',
    day: 6,
    hour: 16,
    minutes: 55,
    priceAud: 3100,
    seatsLeft: 6,
    amenities: ['Catering'],
  },
  {
    id: 'BJ-108',
    operator: 'Southern Cross Aviation',
    model: 'Bombardier Global 7500',
    category: JetCategory.Heavy,
    seats: 16,
    from: 'PER',
    to: 'SIN',
    day: 8,
    hour: 10,
    minutes: 390,
    priceAud: 19600,
    seatsLeft: 12,
    amenities: ['Wi-Fi', 'Chef', 'Flat beds', 'Shower'],
  },
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
      price_per_seat_cents: seed.priceAud * 100,
      currency: 'AUD',
      seats_left: seed.seatsLeft,
      amenities: seed.amenities,
    };
  });
}
