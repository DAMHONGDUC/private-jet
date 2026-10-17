import { runQuery } from '@/core/query/run-query';
import { baseApi } from '@/core/store/base-api';
import type { CharterRequest, LegQuotes } from '../domain/entities/charter';
import type { NewsPost } from '../domain/entities/dashboard';
import type { GetNews } from '../domain/usecases/get-news';
import type { SearchCharters } from '../domain/usecases/search-charters';

export type DashboardDependencies = {
  searchCharters: SearchCharters;
  getNews: GetNews;
};

const deps = (extra: unknown) => extra as DashboardDependencies;

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: build => ({
    searchCharters: build.query<LegQuotes[], CharterRequest>({
      queryFn: (request, { extra }) => runQuery(() => deps(extra).searchCharters.execute(request)),
    }),
    getNews: build.query<NewsPost[], void>({
      queryFn: (_arg, { extra }) => runQuery(() => deps(extra).getNews.execute()),
    }),
  }),
});

export const { useSearchChartersQuery, useGetNewsQuery } = dashboardApi;
