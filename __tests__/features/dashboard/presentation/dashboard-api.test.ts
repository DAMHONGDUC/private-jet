import { createTestStore } from '@test-utils/test-store';
import { TripType } from '@/features/dashboard/domain/entities/charter';
import { dashboardApi } from '@/features/dashboard/presentation/dashboard-api';

test('searches charters, and news through the use cases', async () => {
  const store = createTestStore();
  const request = {
    tripType: TripType.OneWay as const,
    legs: [
      { origin: 'SYD', destination: 'MEB', date: '2026-10-20', passengers: 2 },
    ],
  };

  const [charters, news] = await Promise.all([
    store.dispatch(dashboardApi.endpoints.searchCharters.initiate(request)),
    store.dispatch(dashboardApi.endpoints.getNews.initiate()),
  ]);

  expect(charters.data?.[0].quotes[0].aircraft.model).toBe('Pilatus PC-12 NGX');
  expect(news.data?.map(post => post.id)).toEqual([
    'n1',
    'n2',
    'n3',
    'n5',
    'n7',
  ]);
});
