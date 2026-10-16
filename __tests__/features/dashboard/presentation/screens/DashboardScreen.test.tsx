import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithStore } from '@test-utils/test-store';
import { DashboardScreen } from '@/features/dashboard/presentation/screens/DashboardScreen';

test('shows the summary and routes its actions', async () => {
  const onOpenTrips = jest.fn();
  const onFindFlights = jest.fn();
  await renderWithStore(<DashboardScreen onOpenTrips={onOpenTrips} onFindFlights={onFindFlights} />);

  expect(await screen.findByTestId('dashboard-greeting')).toHaveTextContent('Welcome back, Duc');
  // 18 400 points from the membership + €2 400 seed booking / 10.
  expect(screen.getByTestId('loyalty-points')).toHaveTextContent('18,640');
  expect(screen.getByTestId('stat-upcoming')).toHaveTextContent(/^1/);
  expect(screen.getByTestId('next-trip')).toHaveTextContent(/GVA/);

  await fireEvent.press(screen.getByTestId('next-trip'));
  await fireEvent.press(screen.getByTestId('find-flights'));
  expect(onOpenTrips).toHaveBeenCalled();
  expect(onFindFlights).toHaveBeenCalled();
});
