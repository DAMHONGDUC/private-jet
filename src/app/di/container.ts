import { BookingMockDataSource } from '@/features/booking/data/datasources/booking-mock-data-source';
import { BookingRepositoryImpl } from '@/features/booking/data/repositories/booking-repository-impl';
import { BookFlight } from '@/features/booking/domain/usecases/book-flight';
import { GetBookings } from '@/features/booking/domain/usecases/get-bookings';
import type { BookingDependencies } from '@/features/booking/presentation/booking-api';
import { CharterMockDataSource } from '@/features/dashboard/data/datasources/charter-mock-data-source';
import { DashboardMockDataSource } from '@/features/dashboard/data/datasources/dashboard-mock-data-source';
import { CharterRepositoryImpl } from '@/features/dashboard/data/repositories/charter-repository-impl';
import { DashboardRepositoryImpl } from '@/features/dashboard/data/repositories/dashboard-repository-impl';
import { GetInbox } from '@/features/dashboard/domain/usecases/get-inbox';
import { GetNews } from '@/features/dashboard/domain/usecases/get-news';
import { SearchCharters } from '@/features/dashboard/domain/usecases/search-charters';
import type { DashboardDependencies } from '@/features/dashboard/presentation/dashboard-api';
import { FlightMockDataSource } from '@/features/flights/data/datasources/flight-mock-data-source';
import { FlightRepositoryImpl } from '@/features/flights/data/repositories/flight-repository-impl';
import { GetAirports } from '@/features/flights/domain/usecases/get-airports';
import { GetFlightById } from '@/features/flights/domain/usecases/get-flight-by-id';
import { SearchFlights } from '@/features/flights/domain/usecases/search-flights';
import type { FlightsDependencies } from '@/features/flights/presentation/flights-api';

export type AppDependencies = FlightsDependencies & BookingDependencies & DashboardDependencies;

export type DependencyOptions = {
  /** Fake network delay of every mock data source; 0 in tests. */
  latencyMs?: number;
  now?: () => Date;
  random?: () => number;
};

/**
 * The composition root: the only place that knows which data sources back
 * which repositories. Swap a mock data source for an HTTP one here and
 * nothing above the data layer changes.
 */
export function createDependencies({
  latencyMs = 700,
  now = () => new Date(),
  random,
}: DependencyOptions = {}): AppDependencies {
  const flightRepository = new FlightRepositoryImpl(new FlightMockDataSource(latencyMs, now()));
  const bookingRepository = new BookingRepositoryImpl(
    new BookingMockDataSource(latencyMs, now, random),
  );
  const dashboardRepository = new DashboardRepositoryImpl(new DashboardMockDataSource(latencyMs));
  const charterRepository = new CharterRepositoryImpl(new CharterMockDataSource(latencyMs));

  return {
    searchFlights: new SearchFlights(flightRepository, now),
    getFlightById: new GetFlightById(flightRepository),
    getAirports: new GetAirports(flightRepository),
    bookFlight: new BookFlight(bookingRepository, flightRepository, now),
    getBookings: new GetBookings(bookingRepository),
    searchCharters: new SearchCharters(charterRepository, now),
    getNews: new GetNews(dashboardRepository),
    getInbox: new GetInbox(dashboardRepository),
  };
}
