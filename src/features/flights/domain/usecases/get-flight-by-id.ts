import type { Flight } from '../entities/flight';
import type { FlightRepository } from '../repositories/flight-repository';

export class GetFlightById {
  constructor(private readonly repository: FlightRepository) {}

  execute(id: string): Promise<Flight> {
    return this.repository.getFlightById(id);
  }
}
