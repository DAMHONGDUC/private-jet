import { DomainError } from '@/core/error/app-error';
import { toDayKey } from '@/core/utils/date';
import { departsWithin, type Airport, type Flight, type FlightSearchParams } from '../../domain/entities/flight';
import type { FlightRepository } from '../../domain/repositories/flight-repository';
import type { FlightDataSource } from '../datasources/flight-data-source';
import { toAirport, toFlight } from '../mappers/flight-mapper';

export class FlightRepositoryImpl implements FlightRepository {
  constructor(private readonly dataSource: FlightDataSource) {}

  // The mock filters here; a real backend would take these as query parameters.
  async searchFlights({
    origin,
    destination,
    date,
    passengers,
    time,
    category,
  }: FlightSearchParams): Promise<Flight[]> {
    const dtos = await this.dataSource.getFlights();
    return dtos
      .map(toFlight)
      .filter(flight => !origin || flight.origin.code === origin)
      .filter(flight => !destination || flight.destination.code === destination)
      .filter(flight => !date || toDayKey(new Date(flight.departureAt)) === date)
      .filter(flight => !passengers || flight.seatsAvailable >= passengers)
      .filter(flight => !time || departsWithin(flight, time))
      .filter(flight => !category || flight.aircraft.category === category);
  }

  async getAirports(): Promise<Airport[]> {
    const dtos = await this.dataSource.getAirports();
    return dtos.map(toAirport).sort((a, b) => a.city.localeCompare(b.city));
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
