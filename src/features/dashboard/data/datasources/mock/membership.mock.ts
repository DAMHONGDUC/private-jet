import type { MembershipDto } from '../../models/membership-dto';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const SPEND_EUR = [3200, 8400, 5100, 12600, 7300, 4800];

/** The last six months up to `now`, so the chart always ends on this month. */
export function buildMockMembership(now: Date): MembershipDto {
  const monthly = SPEND_EUR.map((amount, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (SPEND_EUR.length - 1 - index), 1);
    return { month: MONTHS[date.getMonth()], amount_cents: amount * 100 };
  });

  return {
    member_name: 'Duc',
    tier: 'Gold',
    next_tier: 'Platinum',
    points: 18_400,
    next_tier_points: 25_000,
    spent_this_year_cents: 41_400 * 100,
    flight_minutes_this_year: 2_310,
    currency: 'EUR',
    monthly_spend: monthly,
  };
}
