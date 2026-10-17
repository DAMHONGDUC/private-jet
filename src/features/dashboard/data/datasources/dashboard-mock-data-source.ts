import { delay } from '@/core/utils/delay';
import type { InboxDto } from '../models/inbox-dto';
import type { NewsPostDto } from '../models/news-post-dto';
import type { DashboardDataSource } from './dashboard-data-source';
import { buildMockInbox, buildMockNews } from './mock/news.mock';

export class DashboardMockDataSource implements DashboardDataSource {
  constructor(private readonly latencyMs = 700) {}

  async getNews(): Promise<NewsPostDto[]> {
    await delay(this.latencyMs);
    return buildMockNews();
  }

  async getInbox(): Promise<InboxDto> {
    await delay(this.latencyMs);
    return buildMockInbox();
  }
}
