import type { PopularRoute } from '@/features/dashboard/domain/entities/dashboard';
import type { DashboardRepository } from '@/features/dashboard/domain/repositories/dashboard-repository';
import { GetPopularRoutes } from '@/features/dashboard/domain/usecases/get-popular-routes';

const route = (id: string, fromPrice: number) =>
  ({ id, fromPrice } as PopularRoute);

test('keeps the four cheapest routes, cheapest first', async () => {
  const routes = [
    route('a', 9000),
    route('b', 4000),
    route('c', 12000),
    route('d', 7000),
    route('e', 5000),
  ];
  const repository = {
    getPopularRoutes: async () => routes,
  } as unknown as DashboardRepository;

  const popular = await new GetPopularRoutes(repository).execute();

  expect(popular.map(item => item.id)).toEqual(['b', 'e', 'd', 'a']);
});
