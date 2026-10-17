import type { NewsPostDto } from '../models/news-post-dto';

export interface DashboardDataSource {
  getNews(): Promise<NewsPostDto[]>;
}
