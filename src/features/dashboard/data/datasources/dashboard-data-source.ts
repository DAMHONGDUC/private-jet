import type { InboxDto } from '../models/inbox-dto';
import type { NewsPostDto } from '../models/news-post-dto';

export interface DashboardDataSource {
  getNews(): Promise<NewsPostDto[]>;
  getInbox(): Promise<InboxDto>;
}
