import { StatusTone } from '@/core/ui/StatusPill';
import { wallClockIn } from '@/core/utils/date';
import { formatDayKey } from '@/core/utils/format';
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

/** "Fri, 6 Nov · 09:30", by the clock at the first departure airport (`originZone`, IANA) when known. */
export function departureLabel(booking: Booking, originZone?: string): string {
  const { day, time } = wallClockIn(
    new Date(firstLeg(booking).departureAt),
    originZone,
  );
  return `${formatDayKey(day)} · ${time}`;
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
