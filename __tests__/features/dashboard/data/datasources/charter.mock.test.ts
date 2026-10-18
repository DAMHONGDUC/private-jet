import { buildMockQuotes } from '@/features/dashboard/data/datasources/mock/charter.mock';

const query = {
  origin: 'SYD',
  destination: 'MEB',
  date: '2026-10-20',
  passengers: 2,
};

test('prices every jet with room for the party by its flight time', () => {
  const quotes = buildMockQuotes(query);

  expect(quotes).toHaveLength(6);
  expect(
    quotes.every(quote => quote.non_stop && quote.price_cents % 10_000 === 0),
  ).toBe(true);
  expect(
    buildMockQuotes({ ...query, passengers: 10 }).map(
      quote => quote.aircraft_model,
    ),
  ).toEqual(['Dassault Falcon 8X', 'Gulfstream G650ER']);
});

test('adds a fuel stop when the leg is beyond the range', () => {
  const light = buildMockQuotes({ ...query, destination: 'SIN' }).find(
    quote => quote.aircraft_model === 'Pilatus PC-24',
  );

  expect(light?.non_stop).toBe(false);
});

test('has nothing for an airport it does not know', () => {
  expect(buildMockQuotes({ ...query, origin: 'SGN' })).toEqual([]);
});
