import type { Inbox, Membership, NewsPost } from '../entities/dashboard';

export interface DashboardRepository {
  getMembership(): Promise<Membership>;
  /** Every story, drafts and archived ones included. */
  getNews(): Promise<NewsPost[]>;
  getInbox(): Promise<Inbox>;
}
