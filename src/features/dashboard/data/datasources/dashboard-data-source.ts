import type { MembershipDto } from '../models/membership-dto';

export interface DashboardDataSource {
  getMembership(): Promise<MembershipDto>;
}
