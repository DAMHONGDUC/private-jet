import { runQuery } from '@/core/query/run-query';
import { baseApi } from '@/core/store/base-api';
import type { CharterRequest, LegQuotes } from '../domain/entities/charter';
import type { Inbox, NewsPost } from '../domain/entities/dashboard';
import type { GetInbox } from '../domain/usecases/get-inbox';
import type { GetNews } from '../domain/usecases/get-news';
import type { SearchCharters } from '../domain/usecases/search-charters';

export type DashboardDependencies = {
  searchCharters: SearchCharters;
  getNews: GetNews;
  getInbox: GetInbox;
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
    getInbox: build.query<Inbox, void>({
      queryFn: (_arg, { extra }) => runQuery(() => deps(extra).getInbox.execute()),
    }),
  }),
});

export const { useSearchChartersQuery, useGetNewsQuery, useGetInboxQuery } = dashboardApi;
