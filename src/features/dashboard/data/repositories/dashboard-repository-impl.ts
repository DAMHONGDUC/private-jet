import type { Inbox, NewsPost } from '../../domain/entities/dashboard';
import type { DashboardRepository } from '../../domain/repositories/dashboard-repository';
import type { DashboardDataSource } from '../datasources/dashboard-data-source';
import { toInbox, toNewsPost } from '../mappers/news-mapper';

export class DashboardRepositoryImpl implements DashboardRepository {
  constructor(private readonly dataSource: DashboardDataSource) {}

  async getNews(): Promise<NewsPost[]> {
    return (await this.dataSource.getNews()).map(toNewsPost);
  }

  async getInbox(): Promise<Inbox> {
    return toInbox(await this.dataSource.getInbox());
  }
}
