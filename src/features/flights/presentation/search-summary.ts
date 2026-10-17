import { formatDate } from '@/core/utils/format';
import { fromDayKey } from '@/core/utils/date';
import { DEPARTURE_WINDOWS, type Airport, type DepartureWindow } from '../domain/entities/flight';
import { CATEGORY_LABELS } from './components/CategoryChips';
import type { SearchCriteria } from './flight-search-slice';

type AirportsByCode = Record<string, Airport | undefined>;

export const DEPARTURE_WINDOW_LABELS: Record<DepartureWindow, string> = {
  night: 'Night',
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
};

const hour = (value: number) => `${String(value % 24).padStart(2, '0')}:00`;

/** "06:00–12:00" */
export function describeWindowHours(window: DepartureWindow): string {
  const { from, to } = DEPARTURE_WINDOWS[window];
  return `${hour(from)}–${hour(to)}`;
}

export function airportsByCode(airports: Airport[] | undefined): AirportsByCode {
  return Object.fromEntries((airports ?? []).map(airport => [airport.code, airport]));
}

/** "Helsinki → Anywhere", using city names once the airports have loaded. */
export function describeRoute({ origin, destination }: SearchCriteria, airports: AirportsByCode): string {
  const from = origin ? (airports[origin]?.city ?? origin) : 'Any airport';
  const to = destination ? (airports[destination]?.city ?? destination) : 'Anywhere';
  return `${from} → ${to}`;
}

/** "Fri, 17 Oct · Morning · 2 passengers · Heavy jet" */
export function describeDetails({ date, time, passengers, category }: SearchCriteria): string {
  return [
    date ? formatDate(fromDayKey(date).toISOString()) : 'Any date',
    ...(time ? [DEPARTURE_WINDOW_LABELS[time]] : []),
    `${passengers} passenger${passengers > 1 ? 's' : ''}`,
    ...(category ? [CATEGORY_LABELS[category]] : []),
  ].join(' · ');
}
