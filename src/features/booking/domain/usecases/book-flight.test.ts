import type { Flight } from '@/features/flights/domain/entities/flight';
import type { FlightRepository } from '@/features/flights/domain/repositories/flight-repository';
import type { Booking, NewBooking } from '../entities/booking';
import type { BookingRepository } from '../repositories/booking-repository';
import { BookFlight } from './book-flight';

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
    getFlightById: jest.fn().mockResolvedValue({ ...flight, ...overrides }),
    reserveSeats: jest.fn().mockResolvedValue(flight),
  };
  const bookings: jest.Mocked<BookingRepository> = {
    getBookings: jest.fn(),
    createBooking: jest.fn(async (booking: NewBooking): Promise<Booking> => ({
      ...booking,
      id: 'b1',
      reference: 'BJAAAA',
      bookedAt: NOW.toISOString(),
    })),
  };
  return { flights, bookings, useCase: new BookFlight(bookings, flights, () => NOW) };
}

const request = {
  flightId: 'F1',
  passengers: [{ fullName: ' Duc Dam ' }, { fullName: 'An Tran' }],
  contactEmail: 'duc@example.com',
};

describe('BookFlight', () => {
  it('reserves the seats and books at the per-seat price', async () => {
    const { flights, bookings, useCase } = setup();

    const booking = await useCase.execute(request);

    expect(flights.reserveSeats).toHaveBeenCalledWith('F1', 2);
    expect(booking.totalPrice).toBe(5000);
    expect(booking.passengers).toEqual([{ fullName: 'Duc Dam' }, { fullName: 'An Tran' }]);
    expect(bookings.createBooking).toHaveBeenCalledTimes(1);
  });

  it('rejects an invalid request before touching any repository', async () => {
    const { flights, useCase } = setup();

    await expect(useCase.execute({ ...request, contactEmail: 'nope' })).rejects.toMatchObject({
      code: 'VALIDATION',
    });
    expect(flights.getFlightById).not.toHaveBeenCalled();
  });

  it('refuses a flight that has already departed', async () => {
    const { flights, useCase } = setup({ departureAt: '2026-10-16T07:00:00.000Z' });

    await expect(useCase.execute(request)).rejects.toMatchObject({ code: 'VALIDATION' });
    expect(flights.reserveSeats).not.toHaveBeenCalled();
  });
});
