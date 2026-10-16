import type { NewBooking } from '@/features/booking/domain/entities/booking';
import { toBooking, toCreateBookingDto } from '@/features/booking/data/mappers/booking-mapper';

test('round-trips a booking through the DTO, money in cents', () => {
  const booking: NewBooking = {
    flightId: 'BJ-101',
    originCode: 'HEL',
    originCity: 'Helsinki',
    destinationCode: 'LBG',
    destinationCity: 'Paris',
    aircraftModel: 'Jet',
    departureAt: '2026-10-17T09:00:00.000Z',
    durationMinutes: 185,
    passengers: [{ fullName: 'Duc Dam' }],
    contactEmail: 'duc@example.com',
    totalPrice: 2900.5,
    currency: 'EUR',
  };

  const dto = toCreateBookingDto(booking);
  expect(dto.total_cents).toBe(290050);

  const back = toBooking({ ...dto, id: 'b1', pnr: 'BJAAAA', created_at: 'now' });
  expect(back).toEqual({ ...booking, id: 'b1', reference: 'BJAAAA', bookedAt: 'now' });
});
