import { runQuery } from '@/core/query/run-query';
import { baseApi } from '@/core/store/base-api';
import type { DashboardSummary } from '../domain/entities/dashboard';
import type { GetDashboardSummary } from '../domain/usecases/get-dashboard-summary';

export type DashboardDependencies = {
  getDashboardSummary: GetDashboardSummary;
};

const deps = (extra: unknown) => extra as DashboardDependencies;

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: build => ({
    getDashboardSummary: build.query<DashboardSummary, void>({
      queryFn: (_arg, { extra }) => runQuery(() => deps(extra).getDashboardSummary.execute()),
      // Built from bookings too, so a new booking refreshes it.
      providesTags: ['Dashboard', 'Booking'],
    }),
  }),
});

export const { useGetDashboardSummaryQuery } = dashboardApi;
