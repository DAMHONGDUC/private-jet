import { createTestStore } from '@test-utils/test-store';
import { dashboardApi } from '@/features/dashboard/presentation/dashboard-api';

test('searches charters, news and the inbox through the use cases', async () => {
  const store = createTestStore();
  const request = {
    tripType: 'oneWay' as const,
    legs: [{ origin: 'GVA', destination: 'NCE', date: '2026-10-20', passengers: 2 }],
  };

  const [charters, news, inbox] = await Promise.all([
    store.dispatch(dashboardApi.endpoints.searchCharters.initiate(request)),
    store.dispatch(dashboardApi.endpoints.getNews.initiate()),
    store.dispatch(dashboardApi.endpoints.getInbox.initiate()),
  ]);

  expect(charters.data?.[0].quotes[0].aircraft.model).toBe('Pilatus PC-24');
  expect(news.data?.map(post => post.id)).toEqual(['n1', 'n2', 'n3', 'n5', 'n7']);
  expect(inbox.data).toEqual({ unreadMessages: 3, unreadNotifications: 1 });
});
