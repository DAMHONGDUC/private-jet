import { fireEvent, render, screen } from '@testing-library/react-native';
import type { CharterRequest, LegQuotes } from '@/features/dashboard/domain/entities/charter';
import { JetResults } from '@/features/dashboard/presentation/components/JetResults';

const request: CharterRequest = {
  tripType: 'roundTrip',
  legs: [
    { origin: 'GVA', destination: 'NCE', date: '2026-10-20', passengers: 2 },
    { origin: 'NCE', destination: 'GVA', date: '2026-10-22', passengers: 2 },
  ],
};

const quote = {
  id: 'q1',
  aircraft: { model: 'Gulfstream G280', category: 'midsize' as const, totalSeats: 9 },
  photos: ['jet-1', 'jet-2'],
  nonStop: true,
  durationMinutes: 95,
  price: 12_300,
  currency: 'EUR',
};

const props = { request, error: undefined, onNewRequest: jest.fn(), onRetry: jest.fn() };

test('shows skeletons while the quotes load', async () => {
  await render(<JetResults {...props} results={undefined} />);

  expect(screen.getAllByTestId('jet-card-skeleton')).toHaveLength(3);
});

test('groups the quotes by leg and prints each card', async () => {
  const results: LegQuotes[] = [
    { leg: request.legs[0], quotes: [quote] },
    { leg: request.legs[1], quotes: [] },
  ];
  await render(<JetResults {...props} results={results} />);

  expect(screen.getByTestId('jet-results-count')).toHaveTextContent('1');
  expect(screen.getByText('Outbound · GVA → NCE · Oct 20')).toBeOnTheScreen();
  expect(screen.getByTestId('jet-card-q1')).toHaveTextContent(/Gulfstream G280.*Non Stop.*Up to 9 seats.*Midsize.*€12,300.*1h 35m/);
  expect(screen.getByText('No aircraft can fly this leg with 2 on board.')).toBeOnTheScreen();
});

test('offers a new request when no jet is available', async () => {
  const empty = request.legs.map(leg => ({ leg, quotes: [] }));
  await render(<JetResults {...props} results={empty} />);

  expect(screen.getByTestId('no-listings-animation')).toBeOnTheScreen();
  await fireEvent.press(screen.getByTestId('new-flight-request'));
  expect(props.onNewRequest).toHaveBeenCalled();
});
