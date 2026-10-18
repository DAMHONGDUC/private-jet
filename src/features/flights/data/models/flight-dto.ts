// The wire uses the same values as the domain enum.
import type { JetCategory } from '../../domain/entities/flight';

/** The flight as the (mock) backend sends it: snake_case, flat. */
export type FlightDto = {
  id: string;
  operator_name: string;
  aircraft_model: string;
  aircraft_category: JetCategory;
  aircraft_seats: number;
  origin_iata: string;
  origin_city: string;
  origin_airport: string;
  destination_iata: string;
  destination_city: string;
  destination_airport: string;
  departure_time: string;
  arrival_time: string;
  price_per_seat_cents: number;
  currency: string;
  seats_left: number;
  amenities: string[];
};
