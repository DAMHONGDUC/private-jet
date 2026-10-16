import type { BookingRepository } from '@/features/booking/domain/repositories/booking-repository';
import {
  POINTS_PER_CURRENCY_UNIT,
  type DashboardSummary,
} from '../entities/dashboard';
import type { DashboardRepository } from '../repositories/dashboard-repository';

/**
 * Combines the loyalty record with the bookings made in the app: every
 * booking adds to the spend, the flight hours, the points and the current
 * month's bar, so booking a flight visibly moves the dashboard.
 */
export class GetDashboardSummary {
  constructor(
    private readonly dashboard: DashboardRepository,
    private readonly bookings: BookingRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async execute(): Promise<DashboardSummary> {
    const [membership, bookings] = await Promise.all([
      this.dashboard.getMembership(),
      this.bookings.getBookings(),
    ]);
    const now = this.now().getTime();

    const upcoming = bookings
      .filter(booking => new Date(booking.departureAt).getTime() > now)
      .sort((a, b) => a.departureAt.localeCompare(b.departureAt));

    const bookedSpend = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
    const bookedMinutes = bookings.reduce((sum, booking) => sum + booking.durationMinutes, 0);
    const points = membership.points + Math.floor(bookedSpend * POINTS_PER_CURRENCY_UNIT);

    const monthlySpend = membership.monthlySpend.map((entry, index, all) =>
      index === all.length - 1 ? { ...entry, amount: entry.amount + bookedSpend } : entry,
    );

    return {
      memberName: membership.memberName,
      tier: membership.tier,
      nextTier: membership.nextTier,
      points,
      nextTierPoints: membership.nextTierPoints,
      tierProgress: Math.min(1, points / membership.nextTierPoints),
      upcomingTrips: upcoming.length,
      flightHoursThisYear:
        Math.round(((membership.flightMinutesThisYear + bookedMinutes) / 60) * 10) / 10,
      totalSpentThisYear: membership.spentThisYear + bookedSpend,
      currency: membership.currency,
      nextTrip: upcoming[0] ?? null,
      monthlySpend,
    };
  }
}
