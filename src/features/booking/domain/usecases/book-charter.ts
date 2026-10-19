import { AppErrorCode, DomainError } from '@/core/error/app-error';
import { instantAt } from '@/core/utils/date';
import type {
  CharterLeg,
  JetQuote,
} from '@/features/dashboard/domain/entities/charter';
import type { FlightRepository } from '@/features/flights/domain/repositories/flight-repository';
import {
  BookingKind,
  validateTravellers,
  type Booking,
  type NewBooking,
  type Passenger,
} from '../entities/booking';
import { paymentLabel } from '../entities/payment';
import type {
  BookingRepository,
  PaymentRepository,
} from '../repositories/booking-repository';
import { resolvePaymentMethod } from './payment-choice';

/** One leg of a charter with the jet chosen for it and the local departure time. */
export type CharterSelection = {
  leg: CharterLeg;
  quote: JetQuote;
  departureTime: string;
};

export type CharterBookingRequest = {
  selections: CharterSelection[];
  passengers: Passenger[];
  contactEmail: string;
  paymentMethodId?: string;
  notes?: string;
  /** One per checkout attempt; a retry with the same key cannot book or charge twice. */
  idempotencyKey: string;
};

const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Charters the chosen jets: every leg needs a jet with room for the party
 * and a departure in the future; the price is the sum of the quotes.
 * Charging and recording the charter are one backend call.
 */
export class BookCharter {
  constructor(
    private readonly bookings: BookingRepository,
    private readonly flights: FlightRepository,
    private readonly payments: PaymentRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async execute(request: CharterBookingRequest): Promise<Booking> {
    const { selections, passengers } = request;
    if (selections.length === 0) {
      throw new DomainError(
        AppErrorCode.Validation,
        'Choose a jet for every leg.',
      );
    }
    const roomiest = Math.min(
      ...selections.map(selection => selection.quote.aircraft.totalSeats),
    );
    const problem = validateTravellers(
      passengers,
      request.contactEmail,
      roomiest,
    );
    if (problem) {
      throw new DomainError(AppErrorCode.Validation, problem);
    }

    const airports = new Map(
      (await this.flights.getAirports()).map(airport => [airport.code, airport]),
    );
    // Each leg leaves at the chosen time by its own airport's clock.
    const departures = selections.map(({ leg, departureTime }) => {
      if (!TIME.test(departureTime)) {
        throw new DomainError(
          AppErrorCode.Validation,
          'Choose a departure time for every leg.',
        );
      }
      return instantAt(
        leg.date,
        departureTime,
        airports.get(leg.origin)?.timeZone,
      );
    });
    if (departures.some(at => at.getTime() <= this.now().getTime())) {
      throw new DomainError(
        AppErrorCode.Validation,
        'A leg departs in the past. Choose a later time.',
      );
    }
    if (
      departures.some(
        (at, index) =>
          index > 0 && at.getTime() < departures[index - 1].getTime(),
      )
    ) {
      throw new DomainError(
        AppErrorCode.Validation,
        'Each leg must depart after the one before it.',
      );
    }

    const currencies = new Set(
      selections.map(selection => selection.quote.currency),
    );
    if (currencies.size > 1) {
      throw new DomainError(
        AppErrorCode.Validation,
        'All legs must be quoted in the same currency.',
      );
    }
    const total = selections.reduce(
      (sum, selection) => sum + selection.quote.price,
      0,
    );
    const currency = selections[0].quote.currency;
    const payment = await resolvePaymentMethod(
      this.payments,
      request.paymentMethodId,
    );

    const booking: NewBooking = {
      kind: BookingKind.Charter,
      legs: selections.map(({ leg, quote }, index) => ({
        originCode: leg.origin,
        originCity: airports.get(leg.origin)?.city ?? leg.origin,
        destinationCode: leg.destination,
        destinationCity: airports.get(leg.destination)?.city ?? leg.destination,
        aircraftModel: quote.aircraft.model,
        departureAt: departures[index].toISOString(),
        durationMinutes: quote.durationMinutes,
      })),
      passengers: passengers.map(passenger => ({
        fullName: passenger.fullName.trim(),
      })),
      contactEmail: request.contactEmail.trim(),
      totalPrice: total,
      currency,
      paymentLabel: paymentLabel(payment),
      notes: request.notes?.trim() ?? '',
    };
    return this.bookings.placeBooking({
      booking,
      paymentMethodId: payment.id,
      idempotencyKey: request.idempotencyKey,
    });
  }
}
