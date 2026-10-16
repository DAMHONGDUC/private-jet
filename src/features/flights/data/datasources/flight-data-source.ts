import type { FlightDto } from '../models/flight-dto';

/** Where flight DTOs come from. Today a mock; tomorrow an HTTP client. */
export interface FlightDataSource {
  getFlights(): Promise<FlightDto[]>;
  getFlight(id: string): Promise<FlightDto | undefined>;
  /** Returns the updated flight, or undefined when it does not exist. */
  updateSeatsLeft(id: string, seatsLeft: number): Promise<FlightDto | undefined>;
}
