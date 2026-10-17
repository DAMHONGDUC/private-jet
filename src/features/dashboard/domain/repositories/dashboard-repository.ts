import type { Inbox, NewsPost } from '../entities/dashboard';

export interface DashboardRepository {
  /** Every story, drafts and archived ones included. */
  getNews(): Promise<NewsPost[]>;
  getInbox(): Promise<Inbox>;
}
