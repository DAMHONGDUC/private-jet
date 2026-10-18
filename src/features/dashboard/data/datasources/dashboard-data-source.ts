import type { NewsPostDto } from '../models/news-post-dto';
import type { PopularRouteDto } from '../models/popular-route-dto';

export interface DashboardDataSource {
  getNews(): Promise<NewsPostDto[]>;
  getPopularRoutes(): Promise<PopularRouteDto[]>;
}
