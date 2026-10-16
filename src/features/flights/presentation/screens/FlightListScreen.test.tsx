import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithStore } from '@/test-utils/test-store';
import { FlightListScreen } from './FlightListScreen';

test('lists upcoming flights and filters them through the slice', async () => {
  const onOpenFlight = jest.fn();
  const { store } = await renderWithStore(<FlightListScreen onOpenFlight={onOpenFlight} />);

  expect(await screen.findByTestId('flight-card-BJ-101')).toBeOnTheScreen();
  expect(screen.getByTestId('flight-card-BJ-105')).toBeOnTheScreen();

  await fireEvent.press(screen.getByTestId('filter-category-heavy'));

  expect(store.getState().flightsFilter.category).toBe('heavy');
  expect(await screen.findByTestId('flight-card-BJ-105')).toBeOnTheScreen();
  expect(screen.queryByTestId('flight-card-BJ-101')).not.toBeOnTheScreen();

  await fireEvent.press(screen.getByTestId('flight-card-BJ-105'));
  expect(onOpenFlight).toHaveBeenCalledWith('BJ-105');
});
