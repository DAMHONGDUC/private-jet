import { runQuery } from '@/core/query/run-query';
import { baseApi } from '@/core/store/base-api';
import { FLIGHT_LIST_TAG } from '@/features/flights/presentation/flights-api';
import type { Booking, BookingRequest } from '../domain/entities/booking';
import type { BookFlight } from '../domain/usecases/book-flight';
import type { GetBookings } from '../domain/usecases/get-bookings';

export type BookingDependencies = {
  bookFlight: BookFlight;
  getBookings: GetBookings;
};

const deps = (extra: unknown) => extra as BookingDependencies;

export const bookingApi = baseApi.injectEndpoints({
  endpoints: build => ({
    getBookings: build.query<Booking[], void>({
      queryFn: (_arg, { extra }) => runQuery(() => deps(extra).getBookings.execute()),
      providesTags: ['Booking'],
    }),
    bookFlight: build.mutation<Booking, BookingRequest>({
      queryFn: (request, { extra }) => runQuery(() => deps(extra).bookFlight.execute(request)),
      // Seats changed on this flight and in the list; the trips refetch.
      invalidatesTags: (_result, error, { flightId }) =>
        error?.code === 'VALIDATION'
          ? []
          : [{ type: 'Flight', id: flightId }, FLIGHT_LIST_TAG, 'Booking'],
    }),
  }),
});

export const { useGetBookingsQuery, useBookFlightMutation } = bookingApi;
