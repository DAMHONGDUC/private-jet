import { fromDayKey } from '@/core/utils/date';
import type { CharterRequest, TripType } from '../domain/entities/charter';

export const TRIP_TYPE_LABELS: Record<TripType, string> = {
  oneWay: 'One Way',
  roundTrip: 'Round Trip',
  multiCity: 'Multi City',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Oct 20, 2026", the original's `yMMMd`. */
export function formatDay(day: string): string {
  const date = fromDayKey(day);
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/** "Oct 20" */
export function formatShortDay(day: string): string {
  const date = fromDayKey(day);
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

export function passengersLabel(count: number): string {
  return `${count} ${count === 1 ? 'Passenger' : 'Passengers'}`;
}

/** "GVA → NCE", or "GVA → NCE → +2" for the legs after the first. */
export function describeRoute({ legs }: CharterRequest): string {
  const [first, ...rest] = legs;
  const route = `${first.origin} → ${first.destination}`;
  return rest.length > 0 ? `${route} → +${rest.length}` : route;
}

/** "Oct 20 – Oct 24 · 2 pax · Round Trip" */
export function describeDetails({ tripType, legs }: CharterRequest): string {
  const dates =
    tripType === 'roundTrip'
      ? `${formatShortDay(legs[0].date)} – ${formatShortDay(legs[1].date)}`
      : formatShortDay(legs[0].date);
  return [dates, `${legs[0].passengers} pax`, TRIP_TYPE_LABELS[tripType]].join(' · ');
}
