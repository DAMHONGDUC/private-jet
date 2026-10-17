import { act, fireEvent, screen } from '@testing-library/react-native';
import { TEST_NOW, renderWithStore } from '@test-utils/test-store';
import { addDays, toDayKey } from '@/core/utils/date';
import { originSelected } from '@/features/flights/presentation/flight-search-slice';
import { FlightSearchScreen } from '@/features/flights/presentation/screens/FlightSearchScreen';

function setup() {
  const props = { onPickAirport: jest.fn(), onSearch: jest.fn(), onOpenFlight: jest.fn() };
  return { props, render: () => renderWithStore(<FlightSearchScreen {...props} today={TEST_NOW} />) };
}

test('fills the form and searches, then offers the search again', async () => {
  const { props, render } = setup();
  const { store } = await render();
  const day = toDayKey(addDays(TEST_NOW, 2));

  await fireEvent.press(screen.getByTestId('pick-destination'));
  expect(props.onPickAirport).toHaveBeenCalledWith('destination');

  await fireEvent.press(screen.getByTestId(`date-${day}`));
  await fireEvent.press(screen.getByTestId('search-passengers-increment'));
  await fireEvent.press(screen.getByTestId('category-heavy'));
  await fireEvent.press(screen.getByTestId('search-flights'));

  expect(props.onSearch).toHaveBeenCalledTimes(1);
  expect(store.getState().flightSearch).toMatchObject({ date: day, passengers: 2, category: 'heavy' });
  expect(store.getState().flightSearch.recent).toHaveLength(1);

  await fireEvent.press(await screen.findByTestId('recent-search-0'));
  expect(props.onSearch).toHaveBeenCalledTimes(2);
});

test('shows the chosen airports by city and swaps them', async () => {
  const { render } = setup();
  const { store } = await render();

  await act(() => store.dispatch(originSelected('HEL')));
  expect(await screen.findByText('Helsinki')).toBeOnTheScreen();

  await fireEvent.press(screen.getByTestId('swap-airports'));

  expect(store.getState().flightSearch).toMatchObject({ origin: null, destination: 'HEL' });
});

test('lists the next departures and opens one', async () => {
  const { props, render } = setup();
  await render();

  await fireEvent.press(await screen.findByTestId('flight-card-BJ-101'));

  expect(props.onOpenFlight).toHaveBeenCalledWith('BJ-101');
  expect(screen.queryByTestId('flight-card-BJ-104')).not.toBeOnTheScreen();
});
