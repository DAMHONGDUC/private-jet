import type { Membership } from '../../domain/entities/dashboard';
import type { DashboardRepository } from '../../domain/repositories/dashboard-repository';
import type { DashboardDataSource } from '../datasources/dashboard-data-source';
import { toMembership } from '../mappers/membership-mapper';

export class DashboardRepositoryImpl implements DashboardRepository {
  constructor(private readonly dataSource: DashboardDataSource) {}

  async getMembership(): Promise<Membership> {
    return toMembership(await this.dataSource.getMembership());
  }
}
