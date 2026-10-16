import { delay } from '@/core/utils/delay';
import type { FlightDto } from '../models/flight-dto';
import type { FlightDataSource } from './flight-data-source';
import { buildMockFlights } from './mock/flights.mock';

/** In-memory flights with a fake network delay; seats taken stay taken. */
export class FlightMockDataSource implements FlightDataSource {
  private flights: FlightDto[];

  constructor(
    private readonly latencyMs = 600,
    now: Date = new Date(),
  ) {
    this.flights = buildMockFlights(now);
  }

  async getFlights(): Promise<FlightDto[]> {
    await delay(this.latencyMs);
    return this.flights.map(flight => ({ ...flight }));
  }

  async getFlight(id: string): Promise<FlightDto | undefined> {
    await delay(this.latencyMs);
    const flight = this.flights.find(item => item.id === id);
    return flight ? { ...flight } : undefined;
  }

  async updateSeatsLeft(id: string, seatsLeft: number): Promise<FlightDto | undefined> {
    await delay(this.latencyMs);
    this.flights = this.flights.map(item => (item.id === id ? { ...item, seats_left: seatsLeft } : item));
    const flight = this.flights.find(item => item.id === id);
    return flight ? { ...flight } : undefined;
  }
}
