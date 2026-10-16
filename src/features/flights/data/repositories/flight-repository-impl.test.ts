import { FlightMockDataSource } from '../datasources/flight-mock-data-source';
import { FlightRepositoryImpl } from './flight-repository-impl';

const NOW = new Date('2026-10-16T08:00:00.000Z');

const repository = () => new FlightRepositoryImpl(new FlightMockDataSource(0, NOW));

describe('FlightRepositoryImpl on the mock data source', () => {
  it('maps DTOs to entities: euros, minutes and airports', async () => {
    const flight = await repository().getFlightById('BJ-101');

    expect(flight).toMatchObject({
      origin: { code: 'HEL', city: 'Helsinki' },
      destination: { code: 'LBG', city: 'Paris' },
      pricePerSeat: 2900,
      durationMinutes: 185,
      currency: 'EUR',
    });
  });

  it('filters by origin and category', async () => {
    const flights = await repository().searchFlights({ origin: 'HEL', category: 'heavy' });

    expect(flights.map(flight => flight.id)).toEqual(['BJ-108']);
  });

  it('takes reserved seats off the flight for later reads', async () => {
    const repo = repository();

    await repo.reserveSeats('BJ-101', 2);

    expect((await repo.getFlightById('BJ-101')).seatsAvailable).toBe(3);
  });

  it('refuses more seats than are left, and unknown flights', async () => {
    const repo = repository();

    await expect(repo.reserveSeats('BJ-102', 3)).rejects.toMatchObject({ code: 'SOLD_OUT' });
    await expect(repo.reserveSeats('BJ-104', 1)).rejects.toMatchObject({
      code: 'SOLD_OUT',
      message: 'This flight is sold out.',
    });
    await expect(repo.getFlightById('nope')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});
