import type { NewsPost, PopularRoute } from '../entities/dashboard';

export interface DashboardRepository {
  /** Every story, drafts and archived ones included. */
  getNews(): Promise<NewsPost[]>;
  getPopularRoutes(): Promise<PopularRoute[]>;
}
