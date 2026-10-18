import { delay } from '@/core/utils/delay';
import type { NewsPostDto } from '../models/news-post-dto';
import type { PopularRouteDto } from '../models/popular-route-dto';
import type { DashboardDataSource } from './dashboard-data-source';
import { buildMockNews } from './mock/news.mock';
import { buildMockRoutes } from './mock/routes.mock';

export class DashboardMockDataSource implements DashboardDataSource {
  constructor(private readonly latencyMs = 700) {}

  async getNews(): Promise<NewsPostDto[]> {
    await delay(this.latencyMs);
    return buildMockNews();
  }

  async getPopularRoutes(): Promise<PopularRouteDto[]> {
    await delay(this.latencyMs);
    return buildMockRoutes();
  }
}
