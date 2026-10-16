import type { Membership } from '../entities/dashboard';

export interface DashboardRepository {
  getMembership(): Promise<Membership>;
}
