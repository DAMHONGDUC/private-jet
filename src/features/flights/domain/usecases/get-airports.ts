import type { Airport } from '../entities/flight';
import type { FlightRepository } from '../repositories/flight-repository';

export class GetAirports {
  constructor(private readonly repository: FlightRepository) {}

  execute(): Promise<Airport[]> {
    return this.repository.getAirports();
  }
}
