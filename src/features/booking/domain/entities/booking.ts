import { MAX_SEARCH_PASSENGERS } from '@/features/flights/domain/entities/flight';

export type Passenger = { fullName: string };

/** Seats on a scheduled flight, or a whole aircraft chartered for one or more legs. */
export enum BookingKind {
  Seats = 'seats',
  Charter = 'charter',
}

export enum BookingStatus {
  Confirmed = 'confirmed',
  Cancelled = 'cancelled',
}

export type BookingLeg = {
  originCode: string;
  originCity: string;
  destinationCode: string;
  destinationCity: string;
  aircraftModel: string;
  /** ISO 8601. */
  departureAt: string;
  durationMinutes: number;
  /** The scheduled flight, for seat bookings. */
  flightId?: string;
};

export type Booking = {
  id: string;
  /** What the traveller quotes to the operator, e.g. `BJ7K2Q`. */
  reference: string;
  kind: BookingKind;
  status: BookingStatus;
  /** In flying order; never empty. */
  legs: BookingLeg[];
  passengers: Passenger[];
  contactEmail: string;
  totalPrice: number;
  currency: string;
  /** How it was paid, e.g. "Visa •••• 4242". */
  paymentLabel: string;
  notes: string;
  bookedAt: string;
};

/** Seats on one scheduled flight. */
export type BookingRequest = {
  flightId: string;
  passengers: Passenger[];
  contactEmail: string;
  /** The default card when absent. */
  paymentMethodId?: string;
  /** One per checkout attempt; a retry with the same key cannot book or charge twice. */
  idempotencyKey: string;
};

/** A booking before the backend gives it an id, a reference, a status and a timestamp. */
export type NewBooking = Omit<
  Booking,
  'id' | 'reference' | 'status' | 'bookedAt'
>;

/** A booking to pay for and record in one backend call. */
export type BookingOrder = {
  booking: NewBooking;
  paymentMethodId: string;
  /** Sent again on a retry, so the backend returns the first booking instead of charging twice. */
  idempotencyKey: string;
};

export const MAX_PASSENGERS = MAX_SEARCH_PASSENGERS;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The first problem with the travellers and contact of a request, or null. */
/** The travellers' problems: one per guest field, the email field's, and any about the party as a whole. */
export type TravellerErrors = {
  names: (string | undefined)[];
  contactEmail?: string;
  party?: string;
};

export function travellerErrors(
  passengers: Passenger[],
  contactEmail: string,
  max: number,
): TravellerErrors {
  const party =
    passengers.length === 0
      ? 'Add at least one passenger.'
      : passengers.length > max
      ? `A booking holds at most ${max} passengers.`
      : undefined;
  return {
    names: passengers.map(passenger =>
      passenger.fullName.trim().length < 2
        ? 'Enter the full name as on the passport.'
        : undefined,
    ),
    ...(EMAIL.test(contactEmail.trim())
      ? {}
      : { contactEmail: 'Enter a valid contact email.' }),
    ...(party ? { party } : {}),
  };
}

export const hasTravellerErrors = (errors: TravellerErrors) =>
  !!errors.party || !!errors.contactEmail || errors.names.some(Boolean);

/** The first problem with the travellers, or null. */
export function validateTravellers(
  passengers: Passenger[],
  contactEmail: string,
  max: number,
): string | null {
  const errors = travellerErrors(passengers, contactEmail, max);
  if (errors.party) {
    return errors.party;
  }
  if (errors.names.some(Boolean)) {
    return 'Enter the full name of every passenger.';
  }
  return errors.contactEmail ?? null;
}

/** The first problem with a seat request, or null when it can be booked. */
export function validateBookingRequest(request: BookingRequest): string | null {
  return validateTravellers(
    request.passengers,
    request.contactEmail,
    MAX_PASSENGERS,
  );
}

export function firstLeg(booking: Booking): BookingLeg {
  return booking.legs[0];
}

export function lastLeg(booking: Booking): BookingLeg {
  return booking.legs[booking.legs.length - 1];
}

/** Upcoming while confirmed and the first leg has not left. */
export function isUpcoming(booking: Booking, now: Date): boolean {
  return (
    booking.status === BookingStatus.Confirmed &&
    new Date(firstLeg(booking).departureAt).getTime() > now.getTime()
  );
}

/** Free cancellation until 24 hours before the first departure. */
export const CANCELLATION_WINDOW_HOURS = 24;

export function canCancel(booking: Booking, now: Date): boolean {
  const departure = new Date(firstLeg(booking).departureAt).getTime();
  return (
    booking.status === BookingStatus.Confirmed &&
    departure - now.getTime() > CANCELLATION_WINDOW_HOURS * 3_600_000
  );
}
