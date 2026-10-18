import {
  DEPARTURE_TIME_OPTIONS,
  monthGrid,
  monthIndex,
  monthOf,
  shiftMonth,
} from '@/features/dashboard/presentation/calendar-months';

test('a month fills six Monday-first weeks', () => {
  // 1 October 2026 is a Thursday.
  const grid = monthGrid({ year: 2026, month: 9 });
  expect(grid).toHaveLength(42);
  expect(grid.slice(0, 3)).toEqual([null, null, null]);
  expect(grid[3]?.getDate()).toBe(1);
  expect(grid.filter(Boolean)).toHaveLength(31);
});

test('months shift across years', () => {
  expect(shiftMonth({ year: 2026, month: 11 }, 1)).toEqual({
    year: 2027,
    month: 0,
  });
  expect(shiftMonth({ year: 2026, month: 0 }, -1)).toEqual({
    year: 2025,
    month: 11,
  });
  expect(monthOf('2027-03-10')).toEqual({ year: 2027, month: 2 });
  expect(monthIndex({ year: 2027, month: 0 })).toBeGreaterThan(
    monthIndex({ year: 2026, month: 11 }),
  );
});

test('times run every half hour from 06:00 to 22:00', () => {
  expect(DEPARTURE_TIME_OPTIONS[0]).toBe('06:00');
  expect(DEPARTURE_TIME_OPTIONS[1]).toBe('06:30');
  expect(DEPARTURE_TIME_OPTIONS[DEPARTURE_TIME_OPTIONS.length - 1]).toBe(
    '22:00',
  );
});
