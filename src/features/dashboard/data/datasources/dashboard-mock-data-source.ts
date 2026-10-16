import { delay } from '@/core/utils/delay';
import type { MembershipDto } from '../models/membership-dto';
import type { DashboardDataSource } from './dashboard-data-source';
import { buildMockMembership } from './mock/membership.mock';

export class DashboardMockDataSource implements DashboardDataSource {
  constructor(
    private readonly latencyMs = 700,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async getMembership(): Promise<MembershipDto> {
    await delay(this.latencyMs);
    return buildMockMembership(this.now());
  }
}
