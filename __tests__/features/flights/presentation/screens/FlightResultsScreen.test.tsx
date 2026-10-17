import { fireEvent, screen } from '@testing-library/react-native';
import { TEST_NOW, createTestStore, renderWithStore } from '@test-utils/test-store';
import { addDays, toDayKey } from '@/core/utils/date';
import {
  dateSelected,
  originSelected,
  passengersChanged,
} from '@/features/flights/presentation/flight-search-slice';
import { FlightResultsScreen } from '@/features/flights/presentation/screens/FlightResultsScreen';

test('lists flights for the search and refines by jet', async () => {
  const store = createTestStore();
  store.dispatch(originSelected('HEL'));
  store.dispatch(passengersChanged(3));
  const onOpenFlight = jest.fn();
  await renderWithStore(<FlightResultsScreen onOpenFlight={onOpenFlight} onEditSearch={jest.fn()} />, store);

  expect(await screen.findByTestId('results-count')).toHaveTextContent('2 flights found');
  expect(screen.getByTestId('results-summary')).toHaveTextContent(/Helsinki → Anywhere/);
  expect(screen.getByTestId('flight-card-BJ-101')).toBeOnTheScreen();
  expect(screen.queryByTestId('flight-card-BJ-102')).not.toBeOnTheScreen();

  await fireEvent.press(screen.getByTestId('category-heavy'));

  expect(await screen.findByTestId('results-count')).toHaveTextContent('1 flight found');
  await fireEvent.press(screen.getByTestId('flight-card-BJ-108'));
  expect(onOpenFlight).toHaveBeenCalledWith('BJ-108');
});

test('offers to change a search that finds nothing', async () => {
  const store = createTestStore();
  store.dispatch(originSelected('OLB'));
  store.dispatch(dateSelected(toDayKey(addDays(TEST_NOW, 1))));
  const onEditSearch = jest.fn();
  await renderWithStore(<FlightResultsScreen onOpenFlight={jest.fn()} onEditSearch={onEditSearch} />, store);

  await fireEvent.press(await screen.findByTestId('change-search'));

  expect(onEditSearch).toHaveBeenCalled();
});
