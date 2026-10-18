import { fireEvent, screen } from '@testing-library/react-native';
import { TEST_NOW, renderWithStore } from '@test-utils/test-store';
import { addDays, toDayKey } from '@/core/utils/date';
import { DashboardScreen } from '@/features/dashboard/presentation/screens/DashboardScreen';
import { SearchResultsScreen } from '@/features/dashboard/presentation/screens/SearchResultsScreen';

async function pickAirport(field: string, code: string) {
  await fireEvent.press(screen.getByTestId(field));
  await fireEvent.press(await screen.findByTestId(`airport-option-${code}`));
}

async function fillOneWay(day: string) {
  await pickAirport('outbound-origin', 'SYD');
  await pickAirport('outbound-destination', 'MEB');
  await fireEvent.press(screen.getByTestId('outbound-date'));
  await fireEvent.press(screen.getByTestId(`calendar-${day}`));
  await fireEvent.press(screen.getByTestId('outbound-passengers'));
  await fireEvent.press(screen.getByTestId('count-increment'));
  await fireEvent.press(screen.getByTestId('count-done'));
}

test('shows the unread badges, popular routes and the news', async () => {
  await renderWithStore(<DashboardScreen today={TEST_NOW} />);

  expect(await screen.findByTestId('open-messages-badge')).toHaveTextContent(
    '2',
  );
  expect(screen.getByTestId('open-notifications-badge')).toHaveTextContent('2');
  expect(await screen.findByTestId('popular-route-r1')).toHaveTextContent(
    /Sydney → Melbourne/,
  );
  expect(await screen.findByTestId('news-carousel')).toBeOnTheScreen();
  expect(screen.queryByTestId('jet-results')).toBeNull();
});

test('marks every missing field under the field, and clears each as it is filled', async () => {
  await renderWithStore(<DashboardScreen today={TEST_NOW} />);

  // Nothing is flagged before the first search.
  expect(screen.queryByTestId('outbound-route-error')).toBeNull();

  await fireEvent.press(screen.getByTestId('find-jet'));
  expect(screen.getByTestId('outbound-route-error')).toHaveTextContent(
    /Choose a departure airport.*Choose an arrival airport/,
  );
  expect(screen.getByTestId('outbound-date-error')).toHaveTextContent(
    'Choose a departure date.',
  );
  expect(screen.getByTestId('outbound-passengers-error')).toHaveTextContent(
    'Add at least one guest.',
  );
  expect(screen.queryByTestId('snackbar')).toBeNull();

  await pickAirport('outbound-origin', 'SYD');
  expect(screen.getByTestId('outbound-route-error')).not.toHaveTextContent(
    /departure airport/,
  );
  await pickAirport('outbound-destination', 'MEB');
  expect(screen.queryByTestId('outbound-route-error')).toBeNull();
});

test('a popular route fills the airports of the form', async () => {
  await renderWithStore(<DashboardScreen today={TEST_NOW} />);

  await fireEvent.press(await screen.findByTestId('popular-route-r2'));

  expect(screen.getByTestId('outbound-origin')).toHaveTextContent(/BNE/);
  expect(screen.getByTestId('outbound-destination')).toHaveTextContent(/HTI/);
});

test('searching stores the request and opens the results', async () => {
  const day = toDayKey(addDays(TEST_NOW, 3));
  const onShowResults = jest.fn();
  const { store } = await renderWithStore(
    <DashboardScreen today={TEST_NOW} onShowResults={onShowResults} />,
  );

  await fillOneWay(day);
  await fireEvent.press(screen.getByTestId('find-jet'));

  expect(onShowResults).toHaveBeenCalledTimes(1);
  expect(store.getState().charterSearch.submitted?.legs[0]).toMatchObject({
    origin: 'SYD',
    destination: 'MEB',
  });
  expect(screen.queryByTestId('jet-results')).toBeNull();
});

test('the results screen lists the jets for the search under its form', async () => {
  const day = toDayKey(addDays(TEST_NOW, 3));
  const { store } = await renderWithStore(<DashboardScreen today={TEST_NOW} />);
  await fillOneWay(day);
  await fireEvent.press(screen.getByTestId('find-jet'));
  await screen.unmount();

  const onBack = jest.fn();
  await renderWithStore(
    <SearchResultsScreen onBack={onBack} today={TEST_NOW} />,
    store,
  );

  expect(
    await screen.findByTestId(`jet-card-SYD-MEB-${day}-pilatuspc24`),
  ).toBeOnTheScreen();
  expect(screen.getByTestId('jet-results-count')).toHaveTextContent('6');
  // The form keeps the search, and the pill waiting above sums it up.
  expect(screen.getByTestId('outbound-origin')).toHaveTextContent(/SYD/);
  expect(screen.getByTestId('search-summary')).toHaveTextContent(
    /SYD → MEB.*2 guests · One way/,
  );

  // The pill brings the form back on this screen; only Back leaves it.
  await fireEvent.press(screen.getByTestId('search-summary'));
  expect(onBack).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByTestId('search-results-back'));
  expect(onBack).toHaveBeenCalledTimes(1);
});

test('the results screen runs a changed search in place', async () => {
  const day = toDayKey(addDays(TEST_NOW, 3));
  const { store } = await renderWithStore(<DashboardScreen today={TEST_NOW} />);
  await fillOneWay(day);
  await fireEvent.press(screen.getByTestId('find-jet'));
  await screen.unmount();

  await renderWithStore(
    <SearchResultsScreen onBack={jest.fn()} today={TEST_NOW} />,
    store,
  );
  await screen.findByTestId(`jet-card-SYD-MEB-${day}-pilatuspc24`);

  await pickAirport('outbound-destination', 'SIN');
  await fireEvent.press(screen.getByTestId('find-jet'));

  expect(store.getState().charterSearch.submitted?.legs[0]).toMatchObject({
    origin: 'SYD',
    destination: 'SIN',
  });
  expect(
    await screen.findByTestId(`jet-card-SYD-SIN-${day}-gulfstreamg650er`),
  ).toBeOnTheScreen();
  expect(screen.getByTestId('search-summary')).toHaveTextContent(/SYD → SIN/);
});

test('the pill stays out of the way until the form scrolls off', async () => {
  await renderWithStore(<DashboardScreen today={TEST_NOW} />);

  expect(screen.getByTestId('search-summary-slot')).toHaveProp(
    'pointerEvents',
    'none',
  );
});

test('a multi-city leg lists only the jets with room for the whole party', async () => {
  const day = toDayKey(addDays(TEST_NOW, 3));
  const { store } = await renderWithStore(<DashboardScreen today={TEST_NOW} />);

  await fireEvent.press(screen.getByTestId('trip-type-multiCity'));
  await pickAirport('leg-0-origin', 'SYD');
  await pickAirport('leg-0-destination', 'SIN');
  await fireEvent.press(screen.getByTestId('leg-0-date'));
  await fireEvent.press(screen.getByTestId(`calendar-${day}`));
  await fireEvent.press(screen.getByTestId('leg-0-passengers'));
  for (let i = 1; i < 16; i++) {
    await fireEvent.press(screen.getByTestId('count-increment'));
  }
  expect(screen.getByTestId('count-increment')).toBeDisabled();
  await fireEvent.press(screen.getByTestId('count-done'));
  await fireEvent.press(screen.getByTestId('find-jet'));
  await screen.unmount();

  await renderWithStore(<SearchResultsScreen onBack={jest.fn()} />, store);

  expect(await screen.findByTestId('jet-results-count')).toHaveTextContent('1');
  expect(screen.getByText(/^Leg #1 · SYD → SIN/)).toBeOnTheScreen();
  expect(
    screen.getByTestId(`jet-card-SYD-SIN-${day}-gulfstreamg650er`),
  ).toBeOnTheScreen();
});
