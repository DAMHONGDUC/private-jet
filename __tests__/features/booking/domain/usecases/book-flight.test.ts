import { BookingKind } from '@/features/booking/domain/entities/booking';
import {
  JetCategory,
  type Flight,
} from '@/features/flights/domain/entities/flight';
import type { FlightRepository } from '@/features/flights/domain/repositories/flight-repository';
import {
  createBookingRepository,
  createPaymentRepository,
} from '@test-utils/booking-fakes';
import { BookFlight } from '@/features/booking/domain/usecases/book-flight';

const NOW = new Date('2026-10-16T08:00:00.000Z');

const flight: Flight = {
  id: 'F1',
  operator: 'Op',
  aircraft: { model: 'Jet', category: JetCategory.Light, totalSeats: 6 },
  origin: { code: 'HEL', city: 'Helsinki', name: 'HEL' },
  destination: { code: 'LBG', city: 'Paris', name: 'LBG' },
  departureAt: '2026-10-17T09:00:00.000Z',
  arrivalAt: '2026-10-17T12:00:00.000Z',
  durationMinutes: 180,
  pricePerSeat: 2500,
  currency: 'EUR',
  seatsAvailable: 3,
  amenities: [],
};

function setup(overrides: Partial<Flight> = {}) {
  const flights: jest.Mocked<FlightRepository> = {
    searchFlights: jest.fn(),
    getAirports: jest.fn(),
    getFlightById: jest.fn().mockResolvedValue({ ...flight, ...overrides }),
  };
  const bookings = createBookingRepository(NOW);
  const payments = createPaymentRepository();
  return {
    flights,
    bookings,
    payments,
    useCase: new BookFlight(bookings, flights, payments, () => NOW),
  };
}

const request = {
  flightId: 'F1',
  passengers: [{ fullName: ' Alexander Reed ' }, { fullName: 'Sophia Reed' }],
  contactEmail: 'demo@blackjet.app',
  idempotencyKey: 'key-1',
};

describe('BookFlight', () => {
  it('places the booking on the default card at the per-seat price, in one call', async () => {
    const { bookings, useCase } = setup();

    const booking = await useCase.execute(request);

    expect(bookings.placeBooking).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentMethodId: 'pm-visa',
        idempotencyKey: 'key-1',
      }),
    );
    expect(booking).toMatchObject({
      kind: BookingKind.Seats,
      totalPrice: 5000,
      paymentLabel: 'Visa •••• 4242',
    });
    expect(booking.legs[0]).toMatchObject({
      flightId: 'F1',
      originCode: 'HEL',
      destinationCity: 'Paris',
    });
    expect(booking.passengers).toEqual([
      { fullName: 'Alexander Reed' },
      { fullName: 'Sophia Reed' },
    ]);
    expect(bookings.placeBooking).toHaveBeenCalledTimes(1);
  });

  it('rejects an invalid request before touching any repository', async () => {
    const { flights, useCase } = setup();

    await expect(
      useCase.execute({ ...request, contactEmail: 'nope' }),
    ).rejects.toMatchObject({
      code: 'VALIDATION',
    });
    expect(flights.getFlightById).not.toHaveBeenCalled();
  });

  it('refuses a flight that has already departed, or has too few seats, without placing it', async () => {
    const departed = setup({ departureAt: '2026-10-16T07:00:00.000Z' });
    await expect(departed.useCase.execute(request)).rejects.toMatchObject({
      code: 'VALIDATION',
    });

    const full = setup({ seatsAvailable: 1 });
    await expect(full.useCase.execute(request)).rejects.toMatchObject({
      code: 'SOLD_OUT',
    });

    expect(departed.bookings.placeBooking).not.toHaveBeenCalled();
    expect(full.bookings.placeBooking).not.toHaveBeenCalled();
  });
});
