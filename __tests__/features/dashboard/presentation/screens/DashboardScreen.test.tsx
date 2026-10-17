import { act, fireEvent, screen } from '@testing-library/react-native';
import { TEST_NOW, renderWithStore } from '@test-utils/test-store';
import { addDays, toDayKey } from '@/core/utils/date';
import { DRAFT_MESSAGES } from '@/features/dashboard/domain/entities/charter';
import { DashboardScreen } from '@/features/dashboard/presentation/screens/DashboardScreen';

async function pickAirport(field: string, code: string) {
  await fireEvent.press(screen.getByTestId(field));
  await fireEvent.press(await screen.findByTestId(`airport-option-${code}`));
}

async function fillOneWay(day: string) {
  await pickAirport('outbound-origin', 'GVA');
  await pickAirport('outbound-destination', 'NCE');
  await fireEvent.press(screen.getByTestId('outbound-date'));
  await fireEvent.press(screen.getByTestId(`calendar-${day}`));
  await fireEvent.press(screen.getByTestId('outbound-passengers'));
  await fireEvent.press(screen.getByTestId('count-increment'));
  await fireEvent.press(screen.getByTestId('count-done'));
}

test('shows the unread badges and the news before any search', async () => {
  await renderWithStore(<DashboardScreen today={TEST_NOW} />);

  expect(await screen.findByTestId('open-messages-badge')).toHaveTextContent('3');
  expect(screen.getByTestId('open-notifications-badge')).toHaveTextContent('1');
  expect(await screen.findByTestId('news-carousel')).toBeOnTheScreen();
  expect(screen.queryByTestId('jet-results')).toBeNull();
});

test('reports what the form is missing in the snackbar', async () => {
  jest.useFakeTimers();
  try {
    await renderWithStore(<DashboardScreen today={TEST_NOW} />);

    await fireEvent.press(screen.getByTestId('find-jet'));
    expect(screen.getByTestId('snackbar')).toHaveTextContent(DRAFT_MESSAGES.noOrigin);

    await act(() => jest.advanceTimersByTime(2000));
    expect(screen.queryByTestId('snackbar')).toBeNull();
  } finally {
    jest.useRealTimers();
  }
});

test('lists the jets under the form, and starts over on a new trip type', async () => {
  const day = toDayKey(addDays(TEST_NOW, 3));
  await renderWithStore(<DashboardScreen today={TEST_NOW} />);

  await fillOneWay(day);
  await fireEvent.press(screen.getByTestId('find-jet'));

  expect(await screen.findByTestId(`jet-card-GVA-NCE-${day}-pilatuspc24`)).toBeOnTheScreen();
  expect(screen.getByTestId('jet-results-count')).toHaveTextContent('6');
  expect(screen.queryByTestId('news-carousel')).toBeNull();
  expect(screen.getByTestId('search-summary')).toHaveTextContent(/GVA → NCE.*2 pax · One Way/);
  expect(screen.getByTestId('find-jet')).toHaveTextContent('Find Your Jet');

  await fireEvent.press(screen.getByTestId('outbound-passengers'));
  await fireEvent.press(screen.getByTestId('count-increment'));
  await fireEvent.press(screen.getByTestId('count-done'));
  expect(screen.getByTestId('find-jet')).toHaveTextContent('Update Results');

  await fireEvent.press(screen.getByTestId('trip-type-roundTrip'));
  expect(screen.queryByTestId('jet-results')).toBeNull();
  expect(await screen.findByTestId('news-carousel')).toBeOnTheScreen();
});

test('a multi-city leg lists only the jets with room for the whole party', async () => {
  const day = toDayKey(addDays(TEST_NOW, 3));
  await renderWithStore(<DashboardScreen today={TEST_NOW} />);

  await fireEvent.press(screen.getByTestId('trip-type-multiCity'));
  await pickAirport('leg-0-origin', 'GVA');
  await pickAirport('leg-0-destination', 'DXB');
  await fireEvent.press(screen.getByTestId('leg-0-date'));
  await fireEvent.press(screen.getByTestId(`calendar-${day}`));
  await fireEvent.press(screen.getByTestId('leg-0-passengers'));
  for (let i = 1; i < 16; i++) {
    await fireEvent.press(screen.getByTestId('count-increment'));
  }
  expect(screen.getByTestId('count-increment')).toBeDisabled();
  await fireEvent.press(screen.getByTestId('count-done'));
  await fireEvent.press(screen.getByTestId('find-jet'));

  expect(await screen.findByTestId('jet-results-count')).toHaveTextContent('1');
  expect(screen.getByText(/^Leg #1 · GVA → DXB/)).toBeOnTheScreen();
  expect(screen.getByTestId(`jet-card-GVA-DXB-${day}-gulfstreamg650er`)).toBeOnTheScreen();
});
