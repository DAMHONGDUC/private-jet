// The wire uses the same values as the domain enums.
import type { BookingKind, BookingStatus } from '../../domain/entities/booking';

export type BookingLegDto = {
  flight_id: string | null;
  origin_iata: string;
  origin_city: string;
  destination_iata: string;
  destination_city: string;
  aircraft_model: string;
  departure_time: string;
  duration_minutes: number;
};

export type BookingDto = {
  id: string;
  pnr: string;
  kind: BookingKind;
  status: BookingStatus;
  legs: BookingLegDto[];
  passenger_names: string[];
  contact_email: string;
  total_cents: number;
  currency: string;
  payment_label: string;
  notes: string;
  created_at: string;
};

export type CreateBookingDto = Omit<
  BookingDto,
  'id' | 'pnr' | 'status' | 'created_at'
>;

/** The body of the one call that pays for and records a booking. */
export type PlaceBookingDto = CreateBookingDto & { payment_method_id: string };
