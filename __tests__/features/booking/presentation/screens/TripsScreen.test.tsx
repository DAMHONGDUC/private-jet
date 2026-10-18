import { fireEvent, screen } from '@testing-library/react-native';
import { TEST_NOW, renderWithStore } from '@test-utils/test-store';
import { TripDetailScreen } from '@/features/booking/presentation/screens/TripDetailScreen';
import { TripsScreen } from '@/features/booking/presentation/screens/TripsScreen';

test('splits upcoming trips from flown and cancelled ones', async () => {
  const onOpenTrip = jest.fn();
  await renderWithStore(
    <TripsScreen
      onOpenTrip={onOpenTrip}
      onPlanTrip={jest.fn()}
      now={TEST_NOW}
    />,
  );

  expect(await screen.findByTestId('trip-BJ4F7Q')).toHaveTextContent(
    /Shared flight.*Confirmed.*SYD.*MEB/,
  );
  expect(screen.getByTestId('trip-BJR8MX')).toHaveTextContent(
    /Charter · 2 legs.*BNE.*BNE/,
  );
  expect(screen.queryByTestId('trip-BJ2KQP')).toBeNull();

  await fireEvent.press(screen.getByTestId('trips-tab-past'));
  expect(screen.getByTestId('trip-BJ2KQP')).toHaveTextContent(/Completed/);
  expect(screen.getByTestId('trip-BJX5TN')).toHaveTextContent(/Cancelled/);

  await fireEvent.press(screen.getByTestId('trip-BJ2KQP'));
  expect(onOpenTrip).toHaveBeenCalledWith('bk-seed-3');
});

test('cancels an upcoming trip after confirming', async () => {
  await renderWithStore(
    <TripDetailScreen bookingId="bk-seed-1" now={TEST_NOW} />,
  );

  expect(await screen.findByTestId('trip-reference')).toHaveTextContent(
    'BJ4F7Q',
  );
  expect(screen.getByTestId('trip-status')).toHaveTextContent(/Confirmed/i);

  await fireEvent.press(screen.getByTestId('cancel-trip'));
  await fireEvent.press(screen.getByTestId('confirm-cancel'));

  expect(
    await screen.findByText(/cancelled/i, { exact: false }),
  ).toBeOnTheScreen();
  expect(screen.getByTestId('trip-status')).toHaveTextContent(/Cancelled/i);
  expect(screen.queryByTestId('cancel-trip')).toBeNull();
});

test('a flown trip cannot be cancelled', async () => {
  await renderWithStore(
    <TripDetailScreen bookingId="bk-seed-3" now={TEST_NOW} />,
  );

  expect(await screen.findByTestId('trip-status')).toHaveTextContent(
    /Completed/i,
  );
  expect(screen.queryByTestId('cancel-trip')).toBeNull();
  expect(screen.getByTestId('trip-total')).toHaveTextContent('$27,000');
});

test("a trip's actions are pinned to the bottom, outside its scrolling details", async () => {
  await renderWithStore(
    <TripDetailScreen
      bookingId="bk-seed-1"
      now={TEST_NOW}
      onContactConcierge={jest.fn()}
    />,
  );
  await screen.findByTestId('trip-reference');

  const actions = screen.getByTestId('bottom-actions');
  expect(actions).toContainElement(screen.getByTestId('contact-concierge'));
  expect(actions).toContainElement(screen.getByTestId('cancel-trip'));
  expect(actions).toHaveStyle({ paddingBottom: 8 });
  expect(screen.getByTestId('trip-scroll')).not.toContainElement(actions);
});
