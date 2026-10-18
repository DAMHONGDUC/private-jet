import { fromDayKey } from '@/core/utils/date';

/** A calendar month: `month` is 0-based, as in `Date`. */
export type MonthCursor = { year: number; month: number };

/** How far ahead the calendar lets a trip be planned. */
export const MONTHS_AHEAD = 24;

/** Preferred departure times the search offers, every half hour from 06:00 to 22:00. */
export const DEPARTURE_TIME_OPTIONS: readonly string[] = Array.from(
  { length: 33 },
  (_, index) => {
    const minutes = 6 * 60 + index * 30;
    const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
    return `${hours}:${minutes % 60 === 0 ? '00' : '30'}`;
  },
);

/** Months counted from year 0, so two cursors compare as numbers. */
export const monthIndex = ({ year, month }: MonthCursor) => year * 12 + month;

export const monthOf = (day: string): MonthCursor => {
  const date = fromDayKey(day);
  return { year: date.getFullYear(), month: date.getMonth() };
};

export const shiftMonth = (cursor: MonthCursor, by: number): MonthCursor => {
  const index = monthIndex(cursor) + by;
  return { year: Math.floor(index / 12), month: index % 12 };
};

/** The month's days in Monday-first weeks, padded with nulls to six full weeks so the grid never changes height. */
export function monthGrid({ year, month }: MonthCursor): (Date | null)[] {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7;
  const length = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: 42 }, (_, cell) => {
    const day = cell - lead + 1;
    return day >= 1 && day <= length ? new Date(year, month, day) : null;
  });
}
