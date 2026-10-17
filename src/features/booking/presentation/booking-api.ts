import { runQuery } from '@/core/query/run-query';
import { baseApi } from '@/core/store/base-api';
import { FLIGHT_LIST_TAG } from '@/features/flights/presentation/flights-api';
import type { Booking, BookingRequest } from '../domain/entities/booking';
import type { NewCard, PaymentMethod } from '../domain/entities/payment';
import type { BookCharter, CharterBookingRequest } from '../domain/usecases/book-charter';
import type { BookFlight } from '../domain/usecases/book-flight';
import type { GetBookings } from '../domain/usecases/get-bookings';
import type { CancelBooking, GetBooking } from '../domain/usecases/manage-bookings';
import type { AddCard, GetPaymentMethods, RemoveCard, SetDefaultPayment } from '../domain/usecases/payments';

export type BookingDependencies = {
  bookFlight: BookFlight;
  bookCharter: BookCharter;
  getBookings: GetBookings;
  getBooking: GetBooking;
  cancelBooking: CancelBooking;
  getPaymentMethods: GetPaymentMethods;
  addCard: AddCard;
  setDefaultPayment: SetDefaultPayment;
  removeCard: RemoveCard;
};

const deps = (extra: unknown) => extra as BookingDependencies;

const PAYMENT_TAG = { type: 'Payment', id: 'LIST' } as const;

export const bookingApi = baseApi.injectEndpoints({
  endpoints: build => ({
    getBookings: build.query<Booking[], void>({
      queryFn: (_arg, { extra }) => runQuery(() => deps(extra).getBookings.execute()),
      providesTags: result => [...(result ?? []).map(({ id }) => ({ type: 'Booking' as const, id })), 'Booking'],
    }),
    getBooking: build.query<Booking, string>({
      queryFn: (id, { extra }) => runQuery(() => deps(extra).getBooking.execute(id)),
      providesTags: (_result, _error, id) => [{ type: 'Booking', id }],
    }),
    bookFlight: build.mutation<Booking, BookingRequest>({
      queryFn: (request, { extra }) => runQuery(() => deps(extra).bookFlight.execute(request)),
      // Seats changed on this flight and in the list; the trips and a paying wallet refetch.
      invalidatesTags: (_result, error, { flightId }) =>
        error?.code === 'VALIDATION'
          ? []
          : [{ type: 'Flight', id: flightId }, FLIGHT_LIST_TAG, 'Booking', PAYMENT_TAG],
    }),
    bookCharter: build.mutation<Booking, CharterBookingRequest>({
      queryFn: (request, { extra }) => runQuery(() => deps(extra).bookCharter.execute(request)),
      invalidatesTags: (_result, error) => (error ? [] : ['Booking', PAYMENT_TAG]),
    }),
    cancelBooking: build.mutation<Booking, string>({
      queryFn: (id, { extra }) => runQuery(() => deps(extra).cancelBooking.execute(id)),
      invalidatesTags: (_result, error, id) => (error ? [] : [{ type: 'Booking', id }, 'Booking']),
    }),
    getPaymentMethods: build.query<PaymentMethod[], void>({
      queryFn: (_arg, { extra }) => runQuery(() => deps(extra).getPaymentMethods.execute()),
      providesTags: [PAYMENT_TAG],
    }),
    addCard: build.mutation<PaymentMethod, NewCard>({
      queryFn: (card, { extra }) => runQuery(() => deps(extra).addCard.execute(card)),
      invalidatesTags: (_result, error) => (error ? [] : [PAYMENT_TAG]),
    }),
    setDefaultPayment: build.mutation<PaymentMethod[], string>({
      queryFn: (id, { extra }) => runQuery(() => deps(extra).setDefaultPayment.execute(id)),
      invalidatesTags: [PAYMENT_TAG],
    }),
    removeCard: build.mutation<PaymentMethod[], string>({
      queryFn: (id, { extra }) => runQuery(() => deps(extra).removeCard.execute(id)),
      invalidatesTags: (_result, error) => (error ? [] : [PAYMENT_TAG]),
    }),
  }),
});

export const {
  useGetBookingsQuery,
  useGetBookingQuery,
  useBookFlightMutation,
  useBookCharterMutation,
  useCancelBookingMutation,
  useGetPaymentMethodsQuery,
  useAddCardMutation,
  useSetDefaultPaymentMutation,
  useRemoveCardMutation,
} = bookingApi;
