export type Passenger = { fullName: string };

export type Booking = {
  id: string;
  /** What the traveller quotes to the operator, e.g. `BJ7K2Q`. */
  reference: string;
  flightId: string;
  originCode: string;
  originCity: string;
  destinationCode: string;
  destinationCity: string;
  aircraftModel: string;
  departureAt: string;
  durationMinutes: number;
  passengers: Passenger[];
  contactEmail: string;
  totalPrice: number;
  currency: string;
  bookedAt: string;
};

export type BookingRequest = {
  flightId: string;
  passengers: Passenger[];
  contactEmail: string;
};

/** A booking before the backend gives it an id, a reference and a timestamp. */
export type NewBooking = Omit<Booking, 'id' | 'reference' | 'bookedAt'>;

export const MAX_PASSENGERS = 8;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The first problem with a request, or null when it can be booked. */
export function validateBookingRequest(request: BookingRequest): string | null {
  if (request.passengers.length === 0) {
    return 'Add at least one passenger.';
  }
  if (request.passengers.length > MAX_PASSENGERS) {
    return `A booking holds at most ${MAX_PASSENGERS} passengers.`;
  }
  if (request.passengers.some(passenger => passenger.fullName.trim().length < 2)) {
    return 'Enter the full name of every passenger.';
  }
  if (!EMAIL.test(request.contactEmail.trim())) {
    return 'Enter a valid contact email.';
  }
  return null;
}
