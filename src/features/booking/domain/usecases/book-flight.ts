import { AppErrorCode, DomainError } from '@/core/error/app-error';
import { seatsShortMessage } from '@/features/flights/domain/entities/flight';
import type { FlightRepository } from '@/features/flights/domain/repositories/flight-repository';
import {
  BookingKind,
  validateBookingRequest,
  type Booking,
  type BookingRequest,
  type NewBooking,
} from '../entities/booking';
import { paymentLabel } from '../entities/payment';
import type {
  BookingRepository,
  PaymentRepository,
} from '../repositories/booking-repository';
import { resolvePaymentMethod } from './payment-choice';

/**
 * Books seats on a flight: validates the request and checks the flight has
 * not left and has the seats, then places the booking at the flight's price.
 * Charging, taking the seats and recording the booking are one backend call.
 */
export class BookFlight {
  constructor(
    private readonly bookings: BookingRepository,
    private readonly flights: FlightRepository,
    private readonly payments: PaymentRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async execute(request: BookingRequest): Promise<Booking> {
    const problem = validateBookingRequest(request);
    if (problem) {
      throw new DomainError(AppErrorCode.Validation, problem);
    }

    const flight = await this.flights.getFlightById(request.flightId);
    if (new Date(flight.departureAt).getTime() <= this.now().getTime()) {
      throw new DomainError(
        AppErrorCode.Validation,
        'This flight has already departed.',
      );
    }
    const seats = request.passengers.length;
    if (flight.seatsAvailable < seats) {
      throw new DomainError(
        AppErrorCode.SoldOut,
        seatsShortMessage(flight.seatsAvailable),
      );
    }
    const payment = await resolvePaymentMethod(
      this.payments,
      request.paymentMethodId,
    );

    const booking: NewBooking = {
      kind: BookingKind.Seats,
      legs: [
        {
          flightId: flight.id,
          originCode: flight.origin.code,
          originCity: flight.origin.city,
          destinationCode: flight.destination.code,
          destinationCity: flight.destination.city,
          aircraftModel: flight.aircraft.model,
          departureAt: flight.departureAt,
          durationMinutes: flight.durationMinutes,
        },
      ],
      passengers: request.passengers.map(passenger => ({
        fullName: passenger.fullName.trim(),
      })),
      contactEmail: request.contactEmail.trim(),
      totalPrice: flight.pricePerSeat * seats,
      currency: flight.currency,
      paymentLabel: paymentLabel(payment),
      notes: '',
    };
    return this.bookings.placeBooking({
      booking,
      paymentMethodId: payment.id,
      idempotencyKey: request.idempotencyKey,
    });
  }
}
