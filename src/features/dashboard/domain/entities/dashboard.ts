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

/** A story for the dashboard's carousel. */
export type NewsPost = {
  id: string;
  title: string;
  summary: string;
  /** Key of a bundled image. */
  image: string;
  status: 'published' | 'draft' | 'archived';
};

/** The most stories the carousel shows. */
export const MAX_NEWS_POSTS = 5;

/** Counts behind the badges on the app bar. */
export type Inbox = { unreadMessages: number; unreadNotifications: number };
