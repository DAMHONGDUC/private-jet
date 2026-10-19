/** A local calendar day as `YYYY-MM-DD`, so a searched day matches departures by the traveller's clock. */
export function toDayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Local midnight of a `YYYY-MM-DD` day key. */
export function fromDayKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** A wall clock in some time zone: the day as `YYYY-MM-DD` and the time as `HH:MM`. */
export type WallClock = { day: string; time: string };

/**
 * What a clock in `timeZone` (IANA, e.g. "Asia/Tokyo") shows at `instant`.
 * Without a zone, the device's own clock.
 */
export function wallClockIn(instant: Date, timeZone?: string): WallClock {
  if (!timeZone) {
    const hours = String(instant.getHours()).padStart(2, '0');
    const minutes = String(instant.getMinutes()).padStart(2, '0');
    return { day: toDayKey(instant), time: `${hours}:${minutes}` };
  }
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(instant);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find(p => p.type === type)?.value ?? '00';
  return {
    day: `${part('year')}-${part('month')}-${part('day')}`,
    time: `${part('hour')}:${part('minute')}`,
  };
}

/** A wall clock read as if it were UTC, in milliseconds; only differences between two are meaningful. */
function utcOf({ day, time }: WallClock): number {
  const [year, month, date] = day.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  return Date.UTC(year, month - 1, date, hours, minutes);
}

/** The instant a clock in `timeZone` shows `day` at `time`; the device's clock without a zone. */
export function instantAt(day: string, time: string, timeZone?: string): Date {
  if (!timeZone) {
    const [year, month, date] = day.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    return new Date(year, month - 1, date, hours, minutes);
  }
  // Read the zone's offset at a first guess and correct by it: right except
  // within an hour of a daylight-saving change.
  const wanted = utcOf({ day, time });
  const offset = utcOf(wallClockIn(new Date(wanted), timeZone)) - wanted;
  return new Date(wanted - offset);
}

/** Whole days from one `YYYY-MM-DD` day to another. */
export function daysBetween(from: string, to: string): number {
  return Math.round(
    (utcOf({ day: to, time: '00:00' }) - utcOf({ day: from, time: '00:00' })) /
      86_400_000,
  );
}
