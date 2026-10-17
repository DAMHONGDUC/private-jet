import { MAX_SEARCH_PASSENGERS } from '@/features/flights/domain/entities/flight';

export type Passenger = { fullName: string };

/** Seats on a scheduled flight, or a whole aircraft chartered for one or more legs. */
export type BookingKind = 'seats' | 'charter';
export type BookingStatus = 'confirmed' | 'cancelled';

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
};

/** A booking before the backend gives it an id, a reference, a status and a timestamp. */
export type NewBooking = Omit<Booking, 'id' | 'reference' | 'status' | 'bookedAt'>;

export const MAX_PASSENGERS = MAX_SEARCH_PASSENGERS;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The first problem with the travellers and contact of a request, or null. */
export function validateTravellers(passengers: Passenger[], contactEmail: string, max: number): string | null {
  if (passengers.length === 0) {
    return 'Add at least one passenger.';
  }
  if (passengers.length > max) {
    return `A booking holds at most ${max} passengers.`;
  }
  if (passengers.some(passenger => passenger.fullName.trim().length < 2)) {
    return 'Enter the full name of every passenger.';
  }
  if (!EMAIL.test(contactEmail.trim())) {
    return 'Enter a valid contact email.';
  }
  return null;
}

/** The first problem with a seat request, or null when it can be booked. */
export function validateBookingRequest(request: BookingRequest): string | null {
  return validateTravellers(request.passengers, request.contactEmail, MAX_PASSENGERS);
}

export function firstLeg(booking: Booking): BookingLeg {
  return booking.legs[0];
}

export function lastLeg(booking: Booking): BookingLeg {
  return booking.legs[booking.legs.length - 1];
}

/** Upcoming while confirmed and the first leg has not left. */
export function isUpcoming(booking: Booking, now: Date): boolean {
  return booking.status === 'confirmed' && new Date(firstLeg(booking).departureAt).getTime() > now.getTime();
}

/** Free cancellation until 24 hours before the first departure. */
export const CANCELLATION_WINDOW_HOURS = 24;

export function canCancel(booking: Booking, now: Date): boolean {
  const departure = new Date(firstLeg(booking).departureAt).getTime();
  return booking.status === 'confirmed' && departure - now.getTime() > CANCELLATION_WINDOW_HOURS * 3_600_000;
}
