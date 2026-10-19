import { daysBetween, instantAt, wallClockIn } from '@/core/utils/date';

/** The departure time assumed when the traveller asked for any time of day. */
export const DEFAULT_DEPARTURE_TIME = '09:00';

/** Take-off and landing as each airport's clock shows them. */
export type FlightSchedule = {
  /** `HH:MM`, local at the origin. */
  departs: string;
  /** `HH:MM`, local at the destination. */
  arrives: string;
  /** Days the landing falls after the departure day, by the local clocks: 0, 1, or -1 flying west over the date line. */
  dayShift: number;
};

/**
 * When a flight lands, given when it leaves and how long it takes. Zones
 * are IANA names; a missing zone reads the device's clock, so two missing
 * zones give the same clock at both ends.
 */
export function flightSchedule(
  departure: Date,
  durationMinutes: number,
  zones: { origin?: string; destination?: string } = {},
): FlightSchedule {
  const leaves = wallClockIn(departure, zones.origin);
  const lands = wallClockIn(
    new Date(departure.getTime() + durationMinutes * 60_000),
    zones.destination,
  );
  return {
    departs: leaves.time,
    arrives: lands.time,
    dayShift: daysBetween(leaves.day, lands.day),
  };
}

/** A leg asked for on `day` at `time` (or any time), by the origin's clock. */
export function plannedSchedule(
  day: string,
  time: string | undefined,
  durationMinutes: number,
  zones: { origin?: string; destination?: string } = {},
): FlightSchedule {
  return flightSchedule(
    instantAt(day, time ?? DEFAULT_DEPARTURE_TIME, zones.origin),
    durationMinutes,
    zones,
  );
}
