import type { Flight } from '@/features/flights/domain/entities/flight';
import type { FlightRepository } from '@/features/flights/domain/repositories/flight-repository';
import { createBookingRepository, createPaymentRepository } from '@test-utils/booking-fakes';
import { BookFlight } from '@/features/booking/domain/usecases/book-flight';

const NOW = new Date('2026-10-16T08:00:00.000Z');

const flight: Flight = {
  id: 'F1',
  operator: 'Op',
  aircraft: { model: 'Jet', category: 'light', totalSeats: 6 },
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
    reserveSeats: jest.fn().mockResolvedValue(flight),
  };
  const bookings = createBookingRepository(NOW);
  const payments = createPaymentRepository();
  return { flights, bookings, payments, useCase: new BookFlight(bookings, flights, payments, () => NOW) };
}

const request = {
  flightId: 'F1',
  passengers: [{ fullName: ' Alexander Reed ' }, { fullName: 'Sophia Reed' }],
  contactEmail: 'demo@blackjet.app',
};

describe('BookFlight', () => {
  it('charges the default card, reserves the seats and books at the per-seat price', async () => {
    const { flights, bookings, payments, useCase } = setup();

    const booking = await useCase.execute(request);

    expect(payments.charge).toHaveBeenCalledWith('pm-visa', 5000, 'EUR');
    expect(flights.reserveSeats).toHaveBeenCalledWith('F1', 2);
    expect(booking).toMatchObject({ kind: 'seats', totalPrice: 5000, paymentLabel: 'Visa •••• 4242' });
    expect(booking.legs[0]).toMatchObject({ flightId: 'F1', originCode: 'HEL', destinationCity: 'Paris' });
    expect(booking.passengers).toEqual([{ fullName: 'Alexander Reed' }, { fullName: 'Sophia Reed' }]);
    expect(bookings.createBooking).toHaveBeenCalledTimes(1);
  });

  it('rejects an invalid request before touching any repository', async () => {
    const { flights, useCase } = setup();

    await expect(useCase.execute({ ...request, contactEmail: 'nope' })).rejects.toMatchObject({
      code: 'VALIDATION',
    });
    expect(flights.getFlightById).not.toHaveBeenCalled();
  });

  it('refuses a flight that has already departed, or has too few seats, without charging', async () => {
    const departed = setup({ departureAt: '2026-10-16T07:00:00.000Z' });
    await expect(departed.useCase.execute(request)).rejects.toMatchObject({ code: 'VALIDATION' });

    const full = setup({ seatsAvailable: 1 });
    await expect(full.useCase.execute(request)).rejects.toMatchObject({ code: 'SOLD_OUT' });

    expect(departed.payments.charge).not.toHaveBeenCalled();
    expect(full.payments.charge).not.toHaveBeenCalled();
    expect(full.flights.reserveSeats).not.toHaveBeenCalled();
  });
});
