import {
  DepartureWindow,
  JetCategory,
} from '@/features/flights/domain/entities/flight';
import { addDays, toDayKey } from '@/core/utils/date';
import { FlightMockDataSource } from '@/features/flights/data/datasources/flight-mock-data-source';
import { FlightRepositoryImpl } from '@/features/flights/data/repositories/flight-repository-impl';

const NOW = new Date('2026-10-16T08:00:00.000Z');

const repository = () =>
  new FlightRepositoryImpl(new FlightMockDataSource(0, NOW));

describe('FlightRepositoryImpl on the mock data source', () => {
  it('maps DTOs to entities: dollars, minutes and airports', async () => {
    const flight = await repository().getFlightById('BJ-101');

    expect(flight).toMatchObject({
      origin: { code: 'PER', city: 'Perth' },
      destination: { code: 'OOL', city: 'Gold Coast' },
      pricePerSeat: 4800,
      durationMinutes: 185,
      currency: 'AUD',
    });
  });

  it('filters by origin and category', async () => {
    const flights = await repository().searchFlights({
      origin: 'PER',
      category: JetCategory.Heavy,
    });

    expect(flights.map(flight => flight.id)).toEqual(['BJ-108']);
  });

  it('filters by destination, departure day and seats needed', async () => {
    const repo = repository();
    const ids = async (params: Parameters<typeof repo.searchFlights>[0]) =>
      (await repo.searchFlights(params)).map(flight => flight.id);

    expect(await ids({ destination: 'SIN' })).toEqual([
      'BJ-105',
      'BJ-106',
      'BJ-108',
    ]);
    expect(await ids({ date: toDayKey(addDays(NOW, 2)) })).toEqual([
      'BJ-102',
      'BJ-103',
    ]);
    expect(await ids({ origin: 'PER', passengers: 3 })).toEqual([
      'BJ-101',
      'BJ-108',
    ]);
    expect(await ids({ time: DepartureWindow.Evening })).toEqual(['BJ-105']);
    expect(await ids({ time: DepartureWindow.Afternoon })).toEqual([
      'BJ-102',
      'BJ-107',
    ]);
  });

  it('lists airports by city', async () => {
    const airports = await repository().getAirports();

    expect(airports.map(airport => airport.code)).toEqual([
      'ADL',
      'AKL',
      'DPS',
      'BNE',
      'BME',
      'CNS',
      'CBR',
      'DRW',
      'NAN',
      'OOL',
      'HTI',
      'HBA',
      'HKG',
      'MEB',
      'PER',
      'ZQN',
      'SIN',
      'SYD',
      'HND',
      'AYQ',
    ]);
    expect(airports[3]).toEqual({
      code: 'BNE',
      city: 'Brisbane',
      name: 'Brisbane Airport',
      timeZone: 'Australia/Brisbane',
    });
  });

  it('reports an unknown flight as NOT_FOUND', async () => {
    await expect(repository().getFlightById('nope')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
});
