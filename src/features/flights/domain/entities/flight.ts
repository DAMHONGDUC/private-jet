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
  origin?: string;
  category?: JetCategory;
};

export function isSoldOut(flight: Flight): boolean {
  return flight.seatsAvailable === 0;
}
