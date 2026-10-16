import { DomainError } from '@/core/error/app-error';
import type { Flight, FlightSearchParams } from '../../domain/entities/flight';
import type { FlightRepository } from '../../domain/repositories/flight-repository';
import type { FlightDataSource } from '../datasources/flight-data-source';
import { toFlight } from '../mappers/flight-mapper';

export class FlightRepositoryImpl implements FlightRepository {
  constructor(private readonly dataSource: FlightDataSource) {}

  async searchFlights({ origin, category }: FlightSearchParams): Promise<Flight[]> {
    const dtos = await this.dataSource.getFlights();
    return dtos
      .map(toFlight)
      .filter(flight => !origin || flight.origin.code === origin)
      .filter(flight => !category || flight.aircraft.category === category);
  }

  async getFlightById(id: string): Promise<Flight> {
    const dto = await this.dataSource.getFlight(id);
    if (!dto) {
      throw new DomainError('NOT_FOUND', `Flight ${id} was not found.`);
    }
    return toFlight(dto);
  }

  async reserveSeats(flightId: string, count: number): Promise<Flight> {
    const flight = await this.getFlightById(flightId);
    if (flight.seatsAvailable < count) {
      throw new DomainError(
        'SOLD_OUT',
        flight.seatsAvailable === 0
          ? 'This flight is sold out.'
          : `Only ${flight.seatsAvailable} seat(s) left on this flight.`,
      );
    }

    const updated = await this.dataSource.updateSeatsLeft(flightId, flight.seatsAvailable - count);
    if (!updated) {
      throw new DomainError('NOT_FOUND', `Flight ${flightId} was not found.`);
    }
    return toFlight(updated);
  }
}
