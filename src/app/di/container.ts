import { BookingMockDataSource } from '@/features/booking/data/datasources/booking-mock-data-source';
import { BookingRepositoryImpl } from '@/features/booking/data/repositories/booking-repository-impl';
import { BookFlight } from '@/features/booking/domain/usecases/book-flight';
import { GetBookings } from '@/features/booking/domain/usecases/get-bookings';
import type { BookingDependencies } from '@/features/booking/presentation/booking-api';
import { DashboardMockDataSource } from '@/features/dashboard/data/datasources/dashboard-mock-data-source';
import { DashboardRepositoryImpl } from '@/features/dashboard/data/repositories/dashboard-repository-impl';
import { GetDashboardSummary } from '@/features/dashboard/domain/usecases/get-dashboard-summary';
import type { DashboardDependencies } from '@/features/dashboard/presentation/dashboard-api';
import { FlightMockDataSource } from '@/features/flights/data/datasources/flight-mock-data-source';
import { FlightRepositoryImpl } from '@/features/flights/data/repositories/flight-repository-impl';
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
  const dashboardRepository = new DashboardRepositoryImpl(
    new DashboardMockDataSource(latencyMs, now),
  );

  return {
    searchFlights: new SearchFlights(flightRepository, now),
    getFlightById: new GetFlightById(flightRepository),
    bookFlight: new BookFlight(bookingRepository, flightRepository, now),
    getBookings: new GetBookings(bookingRepository),
    getDashboardSummary: new GetDashboardSummary(dashboardRepository, bookingRepository, now),
  };
}
