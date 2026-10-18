import type {
  AirportEnd,
  DraftField,
  LegTarget,
  TripType,
} from '../../domain/entities/charter';

export type BookingCardActions = {
  onTripType: (type: TripType) => void;
  onPickAirport: (target: LegTarget, end: AirportEnd) => void;
  onSwap: (target: LegTarget) => void;
  onPickDate: (target: LegTarget) => void;
  onPickReturnDate: () => void;
  onPickPassengers: (target: LegTarget) => void;
  onAddLeg: () => void;
  onRemoveLeg: (index: number) => void;
  onFind: () => void;
};

/** Each field's problem, worded, keyed like `outbound.origin`; printed under the field's row. */
export type BookingCardErrors = Partial<Record<DraftField, string>>;
