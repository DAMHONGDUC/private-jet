import { instantAt, wallClockIn } from '@/core/utils/date';
import {
  DEFAULT_DEPARTURE_TIME,
  flightSchedule,
  plannedSchedule,
} from '@/features/flights/domain/entities/schedule';

test('reads and sets a clock in another time zone', () => {
  const at = instantAt('2026-10-20', '09:00', 'Australia/Sydney');
  // Sydney is on daylight time (UTC+11) in October.
  expect(at.toISOString()).toBe('2026-10-19T22:00:00.000Z');
  expect(wallClockIn(at, 'Asia/Singapore')).toEqual({
    day: '2026-10-20',
    time: '06:00',
  });
});

test('lands by the destination clock: Sydney to Singapore', () => {
  const schedule = plannedSchedule('2026-10-20', '09:00', 480, {
    origin: 'Australia/Sydney',
    destination: 'Asia/Singapore',
  });
  expect(schedule).toEqual({ departs: '09:00', arrives: '14:00', dayShift: 0 });
});

test('a night flight east lands the next day', () => {
  const schedule = plannedSchedule('2026-10-20', '23:00', 600, {
    origin: 'Asia/Tokyo',
    destination: 'Pacific/Auckland',
  });
  expect(schedule).toEqual({ departs: '23:00', arrives: '13:00', dayShift: 1 });
});

test('any time of day assumes the default departure time', () => {
  const schedule = plannedSchedule('2026-10-20', undefined, 100, {
    origin: 'Australia/Brisbane',
    destination: 'Australia/Brisbane',
  });
  expect(schedule.departs).toBe(DEFAULT_DEPARTURE_TIME);
  expect(schedule.arrives).toBe('10:40');
});

test('without zones both ends read the device clock', () => {
  const departure = new Date(2026, 9, 20, 22, 30);
  expect(flightSchedule(departure, 120)).toEqual({
    departs: '22:30',
    arrives: '00:30',
    dayShift: 1,
  });
});
