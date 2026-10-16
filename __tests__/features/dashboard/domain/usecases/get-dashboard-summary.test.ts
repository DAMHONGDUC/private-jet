import type { Booking } from '@/features/booking/domain/entities/booking';
import type { BookingRepository } from '@/features/booking/domain/repositories/booking-repository';
import type { Membership } from '@/features/dashboard/domain/entities/dashboard';
import type { DashboardRepository } from '@/features/dashboard/domain/repositories/dashboard-repository';
import { GetDashboardSummary } from '@/features/dashboard/domain/usecases/get-dashboard-summary';

const NOW = new Date('2026-10-16T08:00:00.000Z');

const membership: Membership = {
  memberName: 'Duc',
  tier: 'Gold',
  nextTier: 'Platinum',
  points: 1000,
  nextTierPoints: 2000,
  spentThisYear: 10_000,
  flightMinutesThisYear: 600,
  currency: 'EUR',
  monthlySpend: [
    { month: 'Sep', amount: 500 },
    { month: 'Oct', amount: 1000 },
  ],
};

const booking = (id: string, departureAt: string, totalPrice: number) =>
  ({ id, departureAt, totalPrice, durationMinutes: 120 }) as Booking;

test('adds the bookings to the loyalty record', async () => {
  const dashboard: DashboardRepository = { getMembership: async () => membership };
  const bookings = {
    getBookings: async () => [
      booking('past', '2026-10-01T10:00:00.000Z', 2000),
      booking('far', '2026-11-01T10:00:00.000Z', 3000),
      booking('next', '2026-10-20T10:00:00.000Z', 5000),
    ],
  } as unknown as BookingRepository;

  const summary = await new GetDashboardSummary(dashboard, bookings, () => NOW).execute();

  expect(summary.upcomingTrips).toBe(2);
  expect(summary.nextTrip?.id).toBe('next');
  expect(summary.totalSpentThisYear).toBe(20_000);
  expect(summary.points).toBe(2000); // 1000 + 10 000 spent / 10
  expect(summary.tierProgress).toBe(1);
  expect(summary.flightHoursThisYear).toBe(16); // (600 + 3 × 120) / 60
  expect(summary.monthlySpend).toEqual([
    { month: 'Sep', amount: 500 },
    { month: 'Oct', amount: 11_000 },
  ]);
});
