import { JetCategory } from '@/features/flights/domain/entities/flight';
import { BookingKind } from '@/features/booking/domain/entities/booking';
import type { JetQuote } from '@/features/dashboard/domain/entities/charter';
import type { FlightRepository } from '@/features/flights/domain/repositories/flight-repository';
import {
  BookCharter,
  type CharterBookingRequest,
} from '@/features/booking/domain/usecases/book-charter';
import {
  createBookingRepository,
  createPaymentRepository,
} from '@test-utils/booking-fakes';

const NOW = new Date(2026, 9, 16, 8, 0);

const quote = (price: number, seats = 9): JetQuote => ({
  id: `q-${price}`,
  aircraft: {
    model: 'Gulfstream G280',
    category: JetCategory.Midsize,
    totalSeats: seats,
  },
  specs: {
    cruiseKmh: 860,
    rangeKm: 6600,
    baggageM3: 4,
    cabin: 'Stand-up cabin · 1.85 m',
  },
  amenities: ['Wi-Fi'],
  photos: ['jet-1'],
  nonStop: true,
  durationMinutes: 95,
  price,
  currency: 'EUR',
});

const flights = {
  getAirports: jest.fn().mockResolvedValue([
    { code: 'GVA', city: 'Geneva', name: 'Geneva' },
    { code: 'NCE', city: 'Nice', name: 'Nice' },
  ]),
} as unknown as FlightRepository;

const request = (
  overrides: Partial<CharterBookingRequest> = {},
): CharterBookingRequest => ({
  selections: [
    {
      leg: {
        origin: 'GVA',
        destination: 'NCE',
        date: '2026-10-20',
        passengers: 2,
      },
      quote: quote(9000),
      departureTime: '09:30',
    },
    {
      leg: {
        origin: 'NCE',
        destination: 'GVA',
        date: '2026-10-22',
        passengers: 2,
      },
      quote: quote(9500),
      departureTime: '18:00',
    },
  ],
  passengers: [{ fullName: 'Alexander Reed' }, { fullName: 'Sophia Reed' }],
  contactEmail: 'demo@blackjet.app',
  notes: '  Champagne on board  ',
  idempotencyKey: 'key-1',
  ...overrides,
});

function setup() {
  const bookings = createBookingRepository(NOW);
  const payments = createPaymentRepository();
  return {
    bookings,
    payments,
    useCase: new BookCharter(bookings, flights, payments, () => NOW),
  };
}

test('charters every leg at the departure time chosen, for the sum of the quotes', async () => {
  const { bookings, useCase } = setup();

  const booking = await useCase.execute(request());

  // Paying and booking are one call, retried safely under the same key.
  expect(bookings.placeBooking).toHaveBeenCalledTimes(1);
  expect(bookings.placeBooking).toHaveBeenCalledWith(
    expect.objectContaining({
      paymentMethodId: 'pm-visa',
      idempotencyKey: 'key-1',
      booking: expect.objectContaining({ totalPrice: 18_500, currency: 'EUR' }),
    }),
  );
  expect(booking).toMatchObject({
    kind: BookingKind.Charter,
    totalPrice: 18_500,
    notes: 'Champagne on board',
  });
  expect(
    booking.legs.map(leg => [leg.originCity, leg.destinationCity]),
  ).toEqual([
    ['Geneva', 'Nice'],
    ['Nice', 'Geneva'],
  ]);
  expect(new Date(booking.legs[0].departureAt).getHours()).toBe(9);
  expect(new Date(booking.legs[0].departureAt).getMinutes()).toBe(30);
});

test('needs a jet with room for everyone, and legs in order', async () => {
  const { useCase, bookings } = setup();

  const small = request();
  small.selections[1] = { ...small.selections[1], quote: quote(9500, 1) };
  await expect(useCase.execute(small)).rejects.toMatchObject({
    message: 'A booking holds at most 1 passengers.',
  });

  const backwards = request();
  backwards.selections[1] = {
    ...backwards.selections[1],
    leg: { ...backwards.selections[1].leg, date: '2026-10-20' },
    departureTime: '08:00',
  };
  await expect(useCase.execute(backwards)).rejects.toMatchObject({
    message: 'Each leg must depart after the one before it.',
  });

  await expect(
    useCase.execute(request({ selections: [] })),
  ).rejects.toMatchObject({ code: 'VALIDATION' });
  expect(bookings.placeBooking).not.toHaveBeenCalled();
});
