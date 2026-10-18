import type { Flight, FlightSearchParams } from '../entities/flight';
import type { FlightRepository } from '../repositories/flight-repository';

/** Upcoming flights matching the filters, soonest first. */
export class SearchFlights {
  constructor(
    private readonly repository: FlightRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async execute(params: FlightSearchParams = {}): Promise<Flight[]> {
    const flights = await this.repository.searchFlights(params);
    const now = this.now().getTime();

    return flights
      .filter(flight => new Date(flight.departureAt).getTime() > now)
      .sort((a, b) => a.departureAt.localeCompare(b.departureAt));
  }
}
