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
  category?: JetCategory;
};

/** The most seats one search asks for, which is also the most one booking holds. */
export const MAX_SEARCH_PASSENGERS = 8;

export function isSoldOut(flight: Flight): boolean {
  return flight.seatsAvailable === 0;
}
