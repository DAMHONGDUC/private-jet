import { StatusTone } from '@/core/ui/StatusPill';
import { formatDate, formatTime } from '@/core/utils/format';
import {
  BookingKind,
  BookingStatus,
  firstLeg,
  isUpcoming,
  type Booking,
} from '../domain/entities/booking';

/** "GVA → NCE" or "FAB → NCE → FAB". */
export function routeCodes(booking: Booking): string {
  return [
    firstLeg(booking).originCode,
    ...booking.legs.map(leg => leg.destinationCode),
  ].join(' → ');
}

/** "Fri, 6 Nov · 09:30" */
export function departureLabel(booking: Booking): string {
  const at = firstLeg(booking).departureAt;
  return `${formatDate(at)} · ${formatTime(at)}`;
}

export function kindLabel(booking: Booking): string {
  if (booking.kind === BookingKind.Seats) {
    return 'Shared flight';
  }
  return booking.legs.length > 1
    ? `Charter · ${booking.legs.length} legs`
    : 'Charter';
}

export type TripState = {
  label: string;
  tone: StatusTone;
};

export function tripState(booking: Booking, now: Date): TripState {
  if (booking.status === BookingStatus.Cancelled) {
    return { label: 'Cancelled', tone: StatusTone.Danger };
  }
  return isUpcoming(booking, now)
    ? { label: 'Confirmed', tone: StatusTone.Success }
    : { label: 'Completed', tone: StatusTone.Neutral };
}
