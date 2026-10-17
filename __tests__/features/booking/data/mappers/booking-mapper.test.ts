import type { NewBooking } from '@/features/booking/domain/entities/booking';
import { toBooking, toCreateBookingDto, toPaymentMethod } from '@/features/booking/data/mappers/booking-mapper';

test('round-trips a booking through the DTO, money in cents', () => {
  const booking: NewBooking = {
    kind: 'seats',
    legs: [
      {
        flightId: 'BJ-101',
        originCode: 'HEL',
        originCity: 'Helsinki',
        destinationCode: 'LBG',
        destinationCity: 'Paris',
        aircraftModel: 'Jet',
        departureAt: '2026-10-17T09:00:00.000Z',
        durationMinutes: 185,
      },
    ],
    passengers: [{ fullName: 'Alexander Reed' }],
    contactEmail: 'demo@blackjet.app',
    totalPrice: 2900.5,
    currency: 'EUR',
    paymentLabel: 'Visa •••• 4242',
    notes: '',
  };

  const dto = toCreateBookingDto(booking);
  expect(dto.total_cents).toBe(290050);

  const back = toBooking({ ...dto, id: 'b1', pnr: 'BJAAAA', status: 'confirmed', created_at: 'now' });
  expect(back).toEqual({ ...booking, id: 'b1', reference: 'BJAAAA', status: 'confirmed', bookedAt: 'now' });
});

test('reads cards with their expiry and the wallet with its balance', () => {
  const card = { id: 'pm', type: 'card' as const, brand: 'visa' as const, last4: '4242', exp_month: 8, exp_year: 2029, holder: 'A', balance_cents: null, currency: null, is_default: true };
  expect(toPaymentMethod(card)).toEqual({ id: 'pm', kind: 'card', brand: 'visa', last4: '4242', expiry: '08/29', holder: 'A', isDefault: true });

  const wallet = { ...card, id: 'w', type: 'wallet' as const, brand: null, last4: null, exp_month: null, exp_year: null, balance_cents: 150050, currency: 'EUR', is_default: false };
  expect(toPaymentMethod(wallet)).toMatchObject({ kind: 'wallet', balance: 1500.5, currency: 'EUR' });
});
