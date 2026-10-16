export type BookingDto = {
  id: string;
  pnr: string;
  flight_id: string;
  origin_iata: string;
  origin_city: string;
  destination_iata: string;
  destination_city: string;
  aircraft_model: string;
  departure_time: string;
  duration_minutes: number;
  passenger_names: string[];
  contact_email: string;
  total_cents: number;
  currency: string;
  created_at: string;
};

export type CreateBookingDto = Omit<BookingDto, 'id' | 'pnr' | 'created_at'>;
