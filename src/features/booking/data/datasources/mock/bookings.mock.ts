import type { BookingDto } from '../../models/booking-dto';

/** One trip already on the account, ten days out, so Trips is never empty. */
export function buildMockBookings(now: Date): BookingDto[] {
  const departure = new Date(now);
  departure.setDate(departure.getDate() + 10);
  departure.setHours(13, 0, 0, 0);

  return [
    {
      id: 'bk-seed-1',
      pnr: 'BJ4F7Q',
      flight_id: 'BJ-090',
      origin_iata: 'GVA',
      origin_city: 'Geneva',
      destination_iata: 'NCE',
      destination_city: 'Nice',
      aircraft_model: 'Embraer Praetor 600',
      departure_time: departure.toISOString(),
      duration_minutes: 60,
      passenger_names: ['Duc Dam'],
      contact_email: 'duc@example.com',
      total_cents: 240000,
      currency: 'EUR',
      created_at: now.toISOString(),
    },
  ];
}
