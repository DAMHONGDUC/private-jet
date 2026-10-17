import type { InboxDto } from '../models/inbox-dto';
import type { MembershipDto } from '../models/membership-dto';
import type { NewsPostDto } from '../models/news-post-dto';

export interface DashboardDataSource {
  getMembership(): Promise<MembershipDto>;
  getNews(): Promise<NewsPostDto[]>;
  getInbox(): Promise<InboxDto>;
}
