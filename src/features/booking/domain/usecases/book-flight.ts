import { DomainError } from '@/core/error/app-error';
import type { FlightRepository } from '@/features/flights/domain/repositories/flight-repository';
import { validateBookingRequest, type Booking, type BookingRequest } from '../entities/booking';
import type { BookingRepository } from '../repositories/booking-repository';

/**
 * Books seats on a flight: validates the request, checks the flight has not
 * left, takes the seats, then records the booking at the flight's price.
 */
export class BookFlight {
  constructor(
    private readonly bookings: BookingRepository,
    private readonly flights: FlightRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async execute(request: BookingRequest): Promise<Booking> {
    const problem = validateBookingRequest(request);
    if (problem) {
      throw new DomainError('VALIDATION', problem);
    }

    const flight = await this.flights.getFlightById(request.flightId);
    if (new Date(flight.departureAt).getTime() <= this.now().getTime()) {
      throw new DomainError('VALIDATION', 'This flight has already departed.');
    }

    const seats = request.passengers.length;
    await this.flights.reserveSeats(flight.id, seats);

    return this.bookings.createBooking({
      flightId: flight.id,
      originCode: flight.origin.code,
      originCity: flight.origin.city,
      destinationCode: flight.destination.code,
      destinationCity: flight.destination.city,
      aircraftModel: flight.aircraft.model,
      departureAt: flight.departureAt,
      durationMinutes: flight.durationMinutes,
      passengers: request.passengers.map(passenger => ({ fullName: passenger.fullName.trim() })),
      contactEmail: request.contactEmail.trim(),
      totalPrice: flight.pricePerSeat * seats,
      currency: flight.currency,
    });
  }
}
