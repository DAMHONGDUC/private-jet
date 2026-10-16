import type { Booking } from '@/features/booking/domain/entities/booking';

export type MonthlySpend = { month: string; amount: number };

/** What the loyalty programme knows about the member, before this app's bookings. */
export type Membership = {
  memberName: string;
  tier: string;
  nextTier: string;
  points: number;
  nextTierPoints: number;
  spentThisYear: number;
  flightMinutesThisYear: number;
  currency: string;
  /** Oldest first; the last entry is the current month. */
  monthlySpend: MonthlySpend[];
};

export type DashboardSummary = {
  memberName: string;
  tier: string;
  nextTier: string;
  points: number;
  nextTierPoints: number;
  /** 0–1, how far the member is towards the next tier. */
  tierProgress: number;
  upcomingTrips: number;
  flightHoursThisYear: number;
  totalSpentThisYear: number;
  currency: string;
  nextTrip: Booking | null;
  monthlySpend: MonthlySpend[];
};

/** Loyalty points earned per unit of currency spent. */
export const POINTS_PER_CURRENCY_UNIT = 0.1;
