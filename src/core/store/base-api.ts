import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import type { AppError } from '@/core/error/app-error';

/**
 * The one RTK Query API. No endpoint talks to the network itself: each
 * feature injects endpoints whose `queryFn` calls a domain use case, so
 * caching, tags and hooks come from RTK Query while data access stays in the
 * data layer.
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery<AppError>(),
  tagTypes: ['Flight', 'Booking'],
  refetchOnFocus: true,
  endpoints: () => ({}),
});
