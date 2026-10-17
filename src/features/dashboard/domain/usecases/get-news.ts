import { MAX_NEWS_POSTS, type NewsPost } from '../entities/dashboard';
import type { DashboardRepository } from '../repositories/dashboard-repository';

/** The first published stories, as many as the carousel holds. */
export class GetNews {
  constructor(private readonly repository: DashboardRepository) {}

  async execute(): Promise<NewsPost[]> {
    const posts = await this.repository.getNews();
    return posts.filter(post => post.status === 'published').slice(0, MAX_NEWS_POSTS);
  }
}
