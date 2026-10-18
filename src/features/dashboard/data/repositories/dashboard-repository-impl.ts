import type { NewsPost, PopularRoute } from '../../domain/entities/dashboard';
import type { DashboardRepository } from '../../domain/repositories/dashboard-repository';
import type { DashboardDataSource } from '../datasources/dashboard-data-source';
import { toNewsPost } from '../mappers/news-mapper';
import { toPopularRoute } from '../mappers/popular-route-mapper';

export class DashboardRepositoryImpl implements DashboardRepository {
  constructor(private readonly dataSource: DashboardDataSource) {}

  async getNews(): Promise<NewsPost[]> {
    return (await this.dataSource.getNews()).map(toNewsPost);
  }

  async getPopularRoutes(): Promise<PopularRoute[]> {
    return (await this.dataSource.getPopularRoutes()).map(toPopularRoute);
  }
}
