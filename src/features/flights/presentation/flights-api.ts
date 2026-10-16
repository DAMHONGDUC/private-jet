import { runQuery } from '@/core/query/run-query';
import { baseApi } from '@/core/store/base-api';
import type { Flight, FlightSearchParams } from '../domain/entities/flight';
import type { GetFlightById } from '../domain/usecases/get-flight-by-id';
import type { SearchFlights } from '../domain/usecases/search-flights';

/** The use cases this feature's endpoints need, injected as the thunk extra. */
export type FlightsDependencies = {
  searchFlights: SearchFlights;
  getFlightById: GetFlightById;
};

const deps = (extra: unknown) => extra as FlightsDependencies;

export const FLIGHT_LIST_TAG = { type: 'Flight', id: 'LIST' } as const;

export const flightsApi = baseApi.injectEndpoints({
  endpoints: build => ({
    searchFlights: build.query<Flight[], FlightSearchParams>({
      queryFn: (params, { extra }) => runQuery(() => deps(extra).searchFlights.execute(params)),
      providesTags: result => [
        ...(result ?? []).map(({ id }) => ({ type: 'Flight' as const, id })),
        FLIGHT_LIST_TAG,
      ],
    }),
    getFlight: build.query<Flight, string>({
      queryFn: (id, { extra }) => runQuery(() => deps(extra).getFlightById.execute(id)),
      providesTags: (_result, _error, id) => [{ type: 'Flight', id }],
    }),
  }),
});

export const { useSearchFlightsQuery, useGetFlightQuery } = flightsApi;
