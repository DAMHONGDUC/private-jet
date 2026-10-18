import {
  TripType,
  type JetQuote,
} from '@/features/dashboard/domain/entities/charter';
import type { CharterRepository } from '@/features/dashboard/domain/repositories/charter-repository';
import { SearchCharters } from '@/features/dashboard/domain/usecases/search-charters';

const NOW = new Date('2026-10-16T08:00:00.000Z');

const quote = (id: string, price: number) => ({ id, price } as JetQuote);

const repository: CharterRepository = {
  getQuotes: async leg =>
    leg.origin === 'GVA' ? [quote('b', 900), quote('a', 300)] : [],
};

test('quotes every leg, cheapest first', async () => {
  const legs = [
    { origin: 'GVA', destination: 'NCE', date: '2026-10-20', passengers: 2 },
    { origin: 'NCE', destination: 'GVA', date: '2026-10-22', passengers: 2 },
  ];

  const result = await new SearchCharters(repository, () => NOW).execute({
    tripType: TripType.RoundTrip,
    legs,
  });

  expect(result.map(group => group.quotes.map(item => item.id))).toEqual([
    ['a', 'b'],
    [],
  ]);
  expect(result[1].leg).toBe(legs[1]);
});

test('refuses legs in the past', async () => {
  const legs = [
    { origin: 'GVA', destination: 'NCE', date: '2026-10-15', passengers: 2 },
  ];

  await expect(
    new SearchCharters(repository, () => NOW).execute({
      tripType: TripType.OneWay,
      legs,
    }),
  ).rejects.toMatchObject({
    code: 'VALIDATION',
  });
});
