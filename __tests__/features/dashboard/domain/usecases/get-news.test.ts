import {
  NewsStatus,
  type NewsPost,
} from '@/features/dashboard/domain/entities/dashboard';
import type { DashboardRepository } from '@/features/dashboard/domain/repositories/dashboard-repository';
import { GetNews } from '@/features/dashboard/domain/usecases/get-news';

const post = (id: string, status: NewsPost['status'] = NewsStatus.Published) =>
  ({ id, status } as NewsPost);

test('keeps the first five published stories', async () => {
  const posts = [
    post('1'),
    post('2', NewsStatus.Draft),
    post('3'),
    post('4', NewsStatus.Archived),
    post('5'),
    post('6'),
    post('7'),
    post('8'),
  ];
  const repository = {
    getNews: async () => posts,
  } as unknown as DashboardRepository;

  const news = await new GetNews(repository).execute();

  expect(news.map(item => item.id)).toEqual(['1', '3', '5', '6', '7']);
});
