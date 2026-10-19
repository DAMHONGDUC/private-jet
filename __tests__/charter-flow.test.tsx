import { fireEvent, render, screen } from '@testing-library/react-native';
import App from '@/app/App';
import { addDays, toDayKey } from '@/core/utils/date';
import { createTestStore } from '@test-utils/test-store';
import { pickCalendarDay } from '@test-utils/calendar';

async function pickAirport(field: string, code: string) {
  await fireEvent.press(screen.getByTestId(field));
  await fireEvent.press(await screen.findByTestId(`airport-option-${code}`));
}

test('charters a jet from the home search to the new trip', async () => {
  await render(<App store={createTestStore()} />);
  // The calendar starts from the real today; any day three weeks out is selectable.
  const day = toDayKey(addDays(new Date(), 21));

  await screen.findByTestId('booking-card');
  await pickAirport('outbound-origin', 'SYD');
  await pickAirport('outbound-destination', 'MEB');
  await fireEvent.press(screen.getByTestId('outbound-date'));
  await pickCalendarDay(day);
  await fireEvent.press(screen.getByTestId('outbound-passengers'));
  await fireEvent.press(screen.getByTestId('count-increment'));
  await fireEvent.press(screen.getByTestId('count-done'));
  await fireEvent.press(screen.getByTestId('find-jet'));

  // The tenth and last jet of the first page; the list ends in the spinner that loads the next.
  const card = `jet-card-SYD-MEB-${day}-pilatuspc24`;
  expect(await screen.findByTestId('jet-results-loading')).toBeOnTheScreen();
  // Taps land on the card's photo pager, which also swipes between photos.
  await fireEvent(await screen.findByTestId(`${card}-photos`), 'layout', {
    nativeEvent: { layout: { width: 360, height: 240 } },
  });
  await fireEvent.press(screen.getByTestId(`${card}-photos-item-0`));
  expect(await screen.findByTestId('quote-model')).toHaveTextContent(
    'Pilatus PC-24',
  );
  await fireEvent.press(screen.getByTestId('quote-choose'));

  expect(await screen.findByTestId('charter-passenger-0')).toHaveProp(
    'value',
    'Alexander Reed',
  );
  await fireEvent.press(screen.getByTestId('charter-pay'));
  expect(
    await screen.findByTestId('charter-passenger-1-error'),
  ).toHaveTextContent('Enter the full name as on the passport.');
  expect(screen.queryByTestId('charter-passenger-0-error')).toBeNull();

  await fireEvent.changeText(
    screen.getByTestId('charter-passenger-1'),
    'Sophia Reed',
  );
  await fireEvent.press(screen.getByTestId('leg-0-time-14:00'));
  await fireEvent.press(screen.getByTestId('payment-pm-wallet'));
  await fireEvent.press(screen.getByTestId('charter-pay'));

  const reference = await screen.findByTestId('booking-reference');
  const code = String(reference.props.children);
  await fireEvent.press(screen.getByTestId('view-trip'));

  expect(await screen.findByTestId('trip-reference')).toHaveTextContent(code);
  expect(screen.getByText('Sovereign Wallet')).toBeOnTheScreen();
  expect(screen.getByText(/14:00/)).toBeOnTheScreen();
});
