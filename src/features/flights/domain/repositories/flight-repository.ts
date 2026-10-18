import type { Airport, Flight, FlightSearchParams } from '../entities/flight';

export interface FlightRepository {
  searchFlights(params: FlightSearchParams): Promise<Flight[]>;
  /** Every airport the operators fly from or to, by city. */
  getAirports(): Promise<Airport[]>;
  /** Throws a `NOT_FOUND` DomainError when there is no such flight. */
  getFlightById(id: string): Promise<Flight>;
}
