import type { FlightSchedule } from '../domain/entities/schedule';

/** "10:59", or "06:20 +1" when it lands the next day by the local clock. */
export function formatArrival({ arrives, dayShift }: FlightSchedule): string {
  if (dayShift === 0) {
    return arrives;
  }
  return `${arrives} ${dayShift > 0 ? '+' : '−'}${Math.abs(dayShift)}`;
}

/** "09:00 → 10:59". */
export function formatSchedule(schedule: FlightSchedule): string {
  return `${schedule.departs} → ${formatArrival(schedule)}`;
}
