/** A quote as the (mock) charter backend sends it. */
export type JetQuoteDto = {
  quote_id: string;
  aircraft_model: string;
  aircraft_class: 'light' | 'midsize' | 'heavy';
  aircraft_seats: number;
  cruise_kmh: number;
  range_km: number;
  baggage_m3: number;
  cabin: string;
  amenities: string[];
  photo_keys: string[];
  non_stop: boolean;
  flight_minutes: number;
  price_cents: number;
  currency: string;
};
