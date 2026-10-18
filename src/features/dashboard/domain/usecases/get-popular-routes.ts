import { MAX_POPULAR_ROUTES, type PopularRoute } from '../entities/dashboard';
import type { DashboardRepository } from '../repositories/dashboard-repository';

/** The routes suggested under the search, cheapest first. */
export class GetPopularRoutes {
  constructor(private readonly repository: DashboardRepository) {}

  async execute(): Promise<PopularRoute[]> {
    const routes = await this.repository.getPopularRoutes();
    return [...routes]
      .sort((a, b) => a.fromPrice - b.fromPrice)
      .slice(0, MAX_POPULAR_ROUTES);
  }
}
