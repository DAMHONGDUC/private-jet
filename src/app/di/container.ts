import { AuthMockDataSource } from '@/features/auth/data/datasources/auth-mock-data-source';
import { AuthRepositoryImpl } from '@/features/auth/data/repositories/auth-repository-impl';
import {
  RestoreSession,
  SignIn,
  SignOut,
  UpdateProfile,
} from '@/features/auth/domain/usecases/auth';
import type { AuthDependencies } from '@/features/auth/presentation/auth-api';
import {
  BookingMockDataSource,
  PaymentMockDataSource,
} from '@/features/booking/data/datasources/booking-mock-data-source';
import {
  BookingRepositoryImpl,
  PaymentRepositoryImpl,
} from '@/features/booking/data/repositories/booking-repository-impl';
import { BookCharter } from '@/features/booking/domain/usecases/book-charter';
import { BookFlight } from '@/features/booking/domain/usecases/book-flight';
import { GetBookings } from '@/features/booking/domain/usecases/get-bookings';
import {
  CancelBooking,
  GetBooking,
} from '@/features/booking/domain/usecases/manage-bookings';
import {
  AddCard,
  GetPaymentMethods,
  RemoveCard,
  SetDefaultPayment,
} from '@/features/booking/domain/usecases/payments';
import type { BookingDependencies } from '@/features/booking/presentation/booking-api';
import { CharterMockDataSource } from '@/features/dashboard/data/datasources/charter-mock-data-source';
import { DashboardMockDataSource } from '@/features/dashboard/data/datasources/dashboard-mock-data-source';
import { CharterRepositoryImpl } from '@/features/dashboard/data/repositories/charter-repository-impl';
import { DashboardRepositoryImpl } from '@/features/dashboard/data/repositories/dashboard-repository-impl';
import { GetNews } from '@/features/dashboard/domain/usecases/get-news';
import { GetPopularRoutes } from '@/features/dashboard/domain/usecases/get-popular-routes';
import { SearchCharters } from '@/features/dashboard/domain/usecases/search-charters';
import type { DashboardDependencies } from '@/features/dashboard/presentation/dashboard-api';
import { FlightMockDataSource } from '@/features/flights/data/datasources/flight-mock-data-source';
import { FlightRepositoryImpl } from '@/features/flights/data/repositories/flight-repository-impl';
import { GetAirports } from '@/features/flights/domain/usecases/get-airports';
import { GetFlightById } from '@/features/flights/domain/usecases/get-flight-by-id';
import { SearchFlights } from '@/features/flights/domain/usecases/search-flights';
import type { FlightsDependencies } from '@/features/flights/presentation/flights-api';
import { InboxMockDataSource } from '@/features/inbox/data/datasources/inbox-mock-data-source';
import { InboxRepositoryImpl } from '@/features/inbox/data/repositories/inbox-repository-impl';
import {
  GetInboxSummary,
  GetMessages,
  GetNotifications,
  MarkMessagesRead,
  MarkNotificationRead,
  SendMessage,
} from '@/features/inbox/domain/usecases/inbox';
import type { InboxDependencies } from '@/features/inbox/presentation/inbox-api';

export type AppDependencies = FlightsDependencies &
  BookingDependencies &
  DashboardDependencies &
  AuthDependencies &
  InboxDependencies;

export type DependencyOptions = {
  /** Fake network delay of every mock data source; 0 in tests. */
  latencyMs?: number;
  now?: () => Date;
  random?: () => number;
};

/**
 * The composition root: the only place that knows which data sources back
 * which repositories. Swap a mock data source for an HTTP one here and
 * nothing above the data layer changes. HTTP data sources share one
 * `HttpClient` (core/http) built with the API base URL and one `TokenStore`,
 * which the auth data source fills at sign-in.
 */
export function createDependencies({
  latencyMs = 700,
  now = () => new Date(),
  random,
}: DependencyOptions = {}): AppDependencies {
  // One mock backend: placing a booking charges the payment mock and takes
  // seats from the flight mock, so the app reads what the booking changed.
  const flightSource = new FlightMockDataSource(latencyMs, now());
  const paymentSource = new PaymentMockDataSource(latencyMs);
  const flightRepository = new FlightRepositoryImpl(flightSource);
  const bookingRepository = new BookingRepositoryImpl(
    new BookingMockDataSource(latencyMs, now, random, {
      payments: paymentSource,
      flights: flightSource,
    }),
  );
  const dashboardRepository = new DashboardRepositoryImpl(
    new DashboardMockDataSource(latencyMs),
  );
  const charterRepository = new CharterRepositoryImpl(
    new CharterMockDataSource(latencyMs),
  );
  const authRepository = new AuthRepositoryImpl(
    new AuthMockDataSource(latencyMs),
  );
  const paymentRepository = new PaymentRepositoryImpl(paymentSource);
  const inboxRepository = new InboxRepositoryImpl(
    new InboxMockDataSource(latencyMs, now),
  );

  return {
    searchFlights: new SearchFlights(flightRepository, now),
    getFlightById: new GetFlightById(flightRepository),
    getAirports: new GetAirports(flightRepository),
    bookFlight: new BookFlight(
      bookingRepository,
      flightRepository,
      paymentRepository,
      now,
    ),
    bookCharter: new BookCharter(
      bookingRepository,
      flightRepository,
      paymentRepository,
      now,
    ),
    getBookings: new GetBookings(bookingRepository),
    getBooking: new GetBooking(bookingRepository),
    cancelBooking: new CancelBooking(bookingRepository, now),
    getPaymentMethods: new GetPaymentMethods(paymentRepository),
    addCard: new AddCard(paymentRepository, now),
    setDefaultPayment: new SetDefaultPayment(paymentRepository),
    removeCard: new RemoveCard(paymentRepository),
    searchCharters: new SearchCharters(charterRepository, now),
    getNews: new GetNews(dashboardRepository),
    getPopularRoutes: new GetPopularRoutes(dashboardRepository),
    restoreSession: new RestoreSession(authRepository),
    signIn: new SignIn(authRepository),
    signOut: new SignOut(authRepository),
    updateProfile: new UpdateProfile(authRepository),
    getInboxSummary: new GetInboxSummary(inboxRepository),
    getNotifications: new GetNotifications(inboxRepository),
    markNotificationRead: new MarkNotificationRead(inboxRepository),
    getMessages: new GetMessages(inboxRepository),
    sendMessage: new SendMessage(inboxRepository),
    markMessagesRead: new MarkMessagesRead(inboxRepository),
  };
}
