import { delay } from '@/core/utils/delay';
import type { InboxDto } from '../models/inbox-dto';
import type { MembershipDto } from '../models/membership-dto';
import type { NewsPostDto } from '../models/news-post-dto';
import type { DashboardDataSource } from './dashboard-data-source';
import { buildMockMembership } from './mock/membership.mock';
import { buildMockInbox, buildMockNews } from './mock/news.mock';

export class DashboardMockDataSource implements DashboardDataSource {
  constructor(
    private readonly latencyMs = 700,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async getMembership(): Promise<MembershipDto> {
    await delay(this.latencyMs);
    return buildMockMembership(this.now());
  }

  async getNews(): Promise<NewsPostDto[]> {
    await delay(this.latencyMs);
    return buildMockNews();
  }

  async getInbox(): Promise<InboxDto> {
    await delay(this.latencyMs);
    return buildMockInbox();
  }
}
