import {
  formatDayIn,
  formatShortDayIn,
  type Translate,
  type TranslationKey,
} from '@/core/i18n/i18n';
import {
  JetCategory,
  type Airport,
} from '@/features/flights/domain/entities/flight';
import { TripType, type CharterRequest } from '../domain/entities/charter';

export const TRIP_TYPE_LABELS: Record<TripType, TranslationKey> = {
  [TripType.OneWay]: 'search.oneWay',
  [TripType.RoundTrip]: 'search.roundTrip',
  [TripType.MultiCity]: 'search.multiCity',
};

export const CATEGORY_LABELS: Record<JetCategory, TranslationKey> = {
  [JetCategory.Light]: 'results.lightJet',
  [JetCategory.Midsize]: 'results.midsize',
  [JetCategory.Heavy]: 'results.heavyJet',
};

export function airportsByCode(
  airports: Airport[] | undefined,
): Record<string, Airport | undefined> {
  return Object.fromEntries(
    (airports ?? []).map(airport => [airport.code, airport]),
  );
}

/** "20 Oct 2026" */
export const formatDay = (day: string, t: Translate) => formatDayIn(t, day);

/** "20 Oct 2026 · 09:30", or the day alone for any time. */
export const formatDayTime = (
  day: string,
  time: string | null | undefined,
  t: Translate,
) =>
  time
    ? t('search.dayAndTime', { day: formatDayIn(t, day), time })
    : formatDayIn(t, day);

/** "20 Oct" */
export const formatShortDay = (day: string, t: Translate) =>
  formatShortDayIn(t, day);

export function passengersLabel(count: number, t: Translate): string {
  return t(
    count === 1 ? 'search.passengerCount' : 'search.passengerCountMany',
    {
      count,
    },
  );
}

/** "GVA → NCE", "GVA ⇄ NCE" there and back, or "GVA → NCE → +2" for the legs after the first. */
export function describeRoute({ tripType, legs }: CharterRequest): string {
  const [first, ...rest] = legs;
  if (tripType === TripType.RoundTrip) {
    return `${first.origin} ⇄ ${first.destination}`;
  }
  const route = `${first.origin} → ${first.destination}`;
  return rest.length > 0 ? `${route} → +${rest.length}` : route;
}

/** "20 Oct – 24 Oct · 2 guests · Return" */
export function describeDetails(
  { tripType, legs }: CharterRequest,
  t: Translate,
): string {
  const dates =
    tripType === TripType.RoundTrip
      ? `${formatShortDay(legs[0].date, t)} – ${formatShortDay(
          legs[1].date,
          t,
        )}`
      : formatShortDay(legs[0].date, t);
  return [
    dates,
    passengersLabel(legs[0].passengers, t),
    t(TRIP_TYPE_LABELS[tripType]),
  ].join(' · ');
}
