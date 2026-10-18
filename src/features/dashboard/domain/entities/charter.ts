import type { Aircraft } from '@/features/flights/domain/entities/flight';

/** One, two (out and back) or several legs, as the dashboard's radio offers. */
export enum TripType {
  OneWay = 'oneWay',
  RoundTrip = 'roundTrip',
  MultiCity = 'multiCity',
}

export const TRIP_TYPES: readonly TripType[] = [
  TripType.OneWay,
  TripType.RoundTrip,
  TripType.MultiCity,
];

/**
 * The legs that are not a multi-city leg: the way out, and the way back of
 * a return trip. A multi-city leg goes by its index instead.
 */
export enum LegSlot {
  Outbound = 'outbound',
  Return = 'return',
}

/** Which leg a field belongs to: the outbound leg, or a multi-city leg by index. */
export type LegTarget = LegSlot.Outbound | number;

export enum AirportEnd {
  Origin = 'origin',
  Destination = 'destination',
}

/** The fields of a leg on the search form. */
export enum DraftPart {
  Origin = 'origin',
  Destination = 'destination',
  Date = 'date',
  Passengers = 'passengers',
}

/** A charter covers any route: the whole aircraft is booked, not seats on a scheduled flight. */
export type CharterLeg = {
  /** IATA codes. */
  origin: string;
  destination: string;
  /** Local departure day, `YYYY-MM-DD`. */
  date: string;
  /** Preferred local departure time, `HH:MM`; absent for any time of day. */
  time?: string;
  passengers: number;
};

export type CharterRequest = { tripType: TripType; legs: CharterLeg[] };

export type JetSpecs = {
  cruiseKmh: number;
  rangeKm: number;
  /** Hold space, cubic metres. */
  baggageM3: number;
  /** "Stand-up cabin · 1.88 m" */
  cabin: string;
};

/** What one aircraft would cost on one leg. */
export type JetQuote = {
  id: string;
  aircraft: Aircraft;
  specs: JetSpecs;
  amenities: string[];
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
  /** `HH:MM`; null or absent for any time of day. */
  time?: string | null;
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
  /** Round Trip only: `HH:MM` of the way back; null or absent for any time. */
  returnTime?: string | null;
  /** Multi City only. */
  legs: DraftLeg[];
};

export const emptyDraftLeg = (): DraftLeg => ({
  origin: null,
  destination: null,
  date: null,
  time: null,
  passengers: 0,
});

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

export type DraftCheck =
  | { request: CharterRequest; error?: undefined }
  | { error: string; request?: undefined };

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
  return {
    origin: leg.origin,
    destination: leg.destination,
    date: leg.date,
    ...(leg.time ? { time: leg.time } : {}),
    passengers: leg.passengers,
  };
}

/**
 * Turns the form into a request, or names the first thing missing, with
 * the messages of the original app (feature-docs/dashboard §3.4).
 */
export function checkDraft(draft: CharterDraft): DraftCheck {
  if (draft.tripType === TripType.MultiCity) {
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
    return { request: { tripType: TripType.MultiCity, legs } };
  }

  const outbound = checkLeg(draft.outbound, '');
  if (typeof outbound === 'string') {
    return { error: outbound };
  }
  if (draft.tripType === TripType.OneWay) {
    return { request: { tripType: TripType.OneWay, legs: [outbound] } };
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
    ...(draft.returnTime ? { time: draft.returnTime } : {}),
    passengers: outbound.passengers,
  };
  return {
    request: { tripType: TripType.RoundTrip, legs: [outbound, inbound] },
  };
}

/** Which problem a field has, by the `DRAFT_MESSAGES` key; the screen words it. */
export type DraftProblem = keyof typeof DRAFT_MESSAGES;
/** A form field: `outbound.origin`, `leg1.date`, `return.date`… */
export type DraftField =
  | `${LegSlot.Outbound | `leg${number}`}.${DraftPart}`
  | `${LegSlot.Return}.${DraftPart.Date}`;

/** Where a leg's fields are: the outbound leg, or a multi-city leg by index. */
export const draftLegKey = (target: LegTarget) =>
  target === LegSlot.Outbound ? LegSlot.Outbound : (`leg${target}` as const);

/** The key of one field of a leg. */
export const draftField = (target: LegTarget, part: DraftPart): DraftField =>
  `${draftLegKey(target)}.${part}`;

export const RETURN_DATE_FIELD: DraftField = `${LegSlot.Return}.${DraftPart.Date}`;

function legProblems(
  leg: DraftLeg,
  target: LegTarget,
): Partial<Record<DraftField, DraftProblem>> {
  const at = (part: DraftPart) => draftField(target, part);
  return {
    ...(leg.origin ? {} : { [at(DraftPart.Origin)]: 'noOrigin' as const }),
    ...(!leg.destination
      ? { [at(DraftPart.Destination)]: 'noDestination' as const }
      : leg.origin === leg.destination
      ? { [at(DraftPart.Destination)]: 'sameAirports' as const }
      : {}),
    ...(leg.date ? {} : { [at(DraftPart.Date)]: 'noDate' as const }),
    ...(leg.passengers >= 1
      ? {}
      : { [at(DraftPart.Passengers)]: 'noPassengers' as const }),
  };
}

/**
 * Every field's problem at once, so the form can mark them all under their
 * fields; `checkDraft` gives only the first.
 */
export function draftFieldErrors(
  draft: CharterDraft,
): Partial<Record<DraftField, DraftProblem>> {
  if (draft.tripType === TripType.MultiCity) {
    return draft.legs.reduce<Partial<Record<DraftField, DraftProblem>>>(
      (errors, leg, index) => {
        const before = draft.legs[index - 1]?.date;
        const outOfOrder = !!before && !!leg.date && leg.date < before;
        return {
          ...errors,
          ...(outOfOrder
            ? { [draftField(index, DraftPart.Date)]: 'legsOutOfOrder' as const }
            : {}),
          ...legProblems(leg, index),
        };
      },
      {},
    );
  }
  const errors = legProblems(draft.outbound, LegSlot.Outbound);
  if (draft.tripType === TripType.OneWay) {
    return errors;
  }
  const back = !draft.returnDate
    ? 'noReturnDate'
    : draft.outbound.date && draft.returnDate < draft.outbound.date
    ? 'returnBeforeDeparture'
    : null;
  return back ? { ...errors, [RETURN_DATE_FIELD]: back } : errors;
}
