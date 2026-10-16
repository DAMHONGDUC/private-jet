export type MembershipDto = {
  member_name: string;
  tier: string;
  next_tier: string;
  points: number;
  next_tier_points: number;
  spent_this_year_cents: number;
  flight_minutes_this_year: number;
  currency: string;
  monthly_spend: { month: string; amount_cents: number }[];
};
