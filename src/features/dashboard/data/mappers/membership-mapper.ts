import type { Membership } from '../../domain/entities/dashboard';
import type { MembershipDto } from '../models/membership-dto';

export function toMembership(dto: MembershipDto): Membership {
  return {
    memberName: dto.member_name,
    tier: dto.tier,
    nextTier: dto.next_tier,
    points: dto.points,
    nextTierPoints: dto.next_tier_points,
    spentThisYear: dto.spent_this_year_cents / 100,
    flightMinutesThisYear: dto.flight_minutes_this_year,
    currency: dto.currency,
    monthlySpend: dto.monthly_spend.map(entry => ({
      month: entry.month,
      amount: entry.amount_cents / 100,
    })),
  };
}
