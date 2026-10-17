export type JetCategory = 'light' | 'midsize' | 'heavy';

export const JET_CATEGORIES: readonly JetCategory[] = ['light', 'midsize', 'heavy'];

export type Airport = {
  code: string;
  city: string;
  name: string;
};

export type Aircraft = {
  model: string;
  category: JetCategory;
  totalSeats: number;
};

export type Flight = {
  id: string;
  operator: string;
  aircraft: Aircraft;
  origin: Airport;
  destination: Airport;
  /** ISO 8601; dates stay strings so the entity is serializable in Redux. */
  departureAt: string;
  arrivalAt: string;
  durationMinutes: number;
  pricePerSeat: number;
  currency: string;
  seatsAvailable: number;
  amenities: string[];
};

export type FlightSearchParams = {
  /** IATA code; any origin when absent. */
  origin?: string;
  /** IATA code; anywhere when absent. */
  destination?: string;
  /** Local departure day, `YYYY-MM-DD`; any day when absent. */
  date?: string;
  /** Seats needed; flights with fewer seats left are left out. */
  passengers?: number;
  /** Local time of day the flight leaves in; any time when absent. */
  time?: DepartureWindow;
  category?: JetCategory;
};

export type DepartureWindow = 'night' | 'morning' | 'afternoon' | 'evening';

/** Local departure hours per window: `from` included, `to` excluded. */
export const DEPARTURE_WINDOWS: Record<DepartureWindow, { from: number; to: number }> = {
  night: { from: 0, to: 6 },
  morning: { from: 6, to: 12 },
  afternoon: { from: 12, to: 18 },
  evening: { from: 18, to: 24 },
};

export const DEPARTURE_WINDOW_ORDER: readonly DepartureWindow[] = ['morning', 'afternoon', 'evening', 'night'];

export function departsWithin(flight: Flight, window: DepartureWindow): boolean {
  const hour = new Date(flight.departureAt).getHours();
  const { from, to } = DEPARTURE_WINDOWS[window];
  return hour >= from && hour < to;
}

/** The most seats one search asks for, which is also the most one booking holds. */
export const MAX_SEARCH_PASSENGERS = 8;

export function isSoldOut(flight: Flight): boolean {
  return flight.seatsAvailable === 0;
}
