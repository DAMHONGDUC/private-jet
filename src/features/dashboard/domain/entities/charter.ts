import type { Aircraft } from '@/features/flights/domain/entities/flight';

/** One, two (out and back) or several legs, as the dashboard's radio offers. */
export type TripType = 'oneWay' | 'roundTrip' | 'multiCity';

export const TRIP_TYPES: readonly TripType[] = ['oneWay', 'roundTrip', 'multiCity'];

/** A charter covers any route: the whole aircraft is booked, not seats on a scheduled flight. */
export type CharterLeg = {
  /** IATA codes. */
  origin: string;
  destination: string;
  /** Local departure day, `YYYY-MM-DD`. */
  date: string;
  passengers: number;
};

export type CharterRequest = { tripType: TripType; legs: CharterLeg[] };

/** What one aircraft would cost on one leg. */
export type JetQuote = {
  id: string;
  aircraft: Aircraft;
  /** Keys of bundled photos; the presentation layer turns them into image sources. */
  photos: string[];
  nonStop: boolean;
  durationMinutes: number;
  price: number;
  currency: string;
};

export type LegQuotes = { leg: CharterLeg; quotes: JetQuote[] };

/** The largest cabin in the fleet. */
export const MAX_CHARTER_PASSENGERS = 16;
export const MAX_MULTI_CITY_LEGS = 5;

/** A leg while it is being filled in; `null` is not chosen yet. */
export type DraftLeg = {
  origin: string | null;
  destination: string | null;
  date: string | null;
  /** 0 until the traveller picks a count. */
  passengers: number;
};

/** The search form as the dashboard holds it. */
export type CharterDraft = {
  tripType: TripType;
  /** One Way and Round Trip: the outbound leg. */
  outbound: DraftLeg;
  /** Round Trip only: the day the same party flies back. */
  returnDate: string | null;
  /** Multi City only. */
  legs: DraftLeg[];
};

export const emptyDraftLeg = (): DraftLeg => ({ origin: null, destination: null, date: null, passengers: 0 });

export const DRAFT_MESSAGES = {
  noOrigin: 'Please Include The Departure Airport.',
  noDestination: 'Please Include The Arrival Airport.',
  noDate: 'Please include the Departure Date',
  noPassengers: 'Please Select at Least One Passenger to Continue',
  noReturnDate: 'Please Select Return Date To Continue',
  returnBeforeDeparture:
    'The Return Date cannot be earlier than the Departure Date. Please select a Return Date that is on or after the Departure Date.',
  sameAirports: 'The Departure and Arrival Airports must be different.',
  legsOutOfOrder: 'Each Flight Leg must depart on or after the one before it.',
} as const;

export type DraftCheck = { request: CharterRequest; error?: undefined } | { error: string; request?: undefined };

function checkLeg(leg: DraftLeg, prefix: string): string | CharterLeg {
  if (!leg.origin) {
    return prefix + DRAFT_MESSAGES.noOrigin;
  }
  if (!leg.destination) {
    return prefix + DRAFT_MESSAGES.noDestination;
  }
  if (leg.origin === leg.destination) {
    return prefix + DRAFT_MESSAGES.sameAirports;
  }
  if (!leg.date) {
    return prefix + DRAFT_MESSAGES.noDate;
  }
  if (leg.passengers < 1) {
    return prefix + DRAFT_MESSAGES.noPassengers;
  }
  return { origin: leg.origin, destination: leg.destination, date: leg.date, passengers: leg.passengers };
}

/**
 * Turns the form into a request, or names the first thing missing, with
 * the messages of the original app (feature-docs/dashboard §3.4).
 */
export function checkDraft(draft: CharterDraft): DraftCheck {
  if (draft.tripType === 'multiCity') {
    const legs: CharterLeg[] = [];
    for (const [index, draftLeg] of draft.legs.entries()) {
      const leg = checkLeg(draftLeg, `Leg #${index + 1}: `);
      if (typeof leg === 'string') {
        return { error: leg };
      }
      const previous = legs[legs.length - 1];
      if (previous && leg.date < previous.date) {
        return { error: DRAFT_MESSAGES.legsOutOfOrder };
      }
      legs.push(leg);
    }
    return { request: { tripType: 'multiCity', legs } };
  }

  const outbound = checkLeg(draft.outbound, '');
  if (typeof outbound === 'string') {
    return { error: outbound };
  }
  if (draft.tripType === 'oneWay') {
    return { request: { tripType: 'oneWay', legs: [outbound] } };
  }
  if (!draft.returnDate) {
    return { error: DRAFT_MESSAGES.noReturnDate };
  }
  if (draft.returnDate < outbound.date) {
    return { error: DRAFT_MESSAGES.returnBeforeDeparture };
  }
  const inbound: CharterLeg = {
    origin: outbound.destination,
    destination: outbound.origin,
    date: draft.returnDate,
    passengers: outbound.passengers,
  };
  return { request: { tripType: 'roundTrip', legs: [outbound, inbound] } };
}
