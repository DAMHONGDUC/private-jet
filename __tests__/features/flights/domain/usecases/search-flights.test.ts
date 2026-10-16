import type { Flight } from '@/features/flights/domain/entities/flight';
import type { FlightRepository } from '@/features/flights/domain/repositories/flight-repository';
import { SearchFlights } from '@/features/flights/domain/usecases/search-flights';

const NOW = new Date('2026-10-16T08:00:00.000Z');

const at = (id: string, departureAt: string) => ({ id, departureAt }) as Flight;

test('returns only upcoming flights, soonest first', async () => {
  const repository = {
    searchFlights: jest.fn().mockResolvedValue([
      at('later', '2026-10-20T10:00:00.000Z'),
      at('gone', '2026-10-15T10:00:00.000Z'),
      at('soon', '2026-10-17T10:00:00.000Z'),
    ]),
  } as unknown as FlightRepository;

  const flights = await new SearchFlights(repository, () => NOW).execute({ origin: 'HEL' });

  expect(flights.map(flight => flight.id)).toEqual(['soon', 'later']);
  expect(repository.searchFlights).toHaveBeenCalledWith({ origin: 'HEL' });
});
