import { act, fireEvent, screen } from '@testing-library/react-native';
import { TEST_NOW, renderWithStore } from '@test-utils/test-store';
import { addDays, toDayKey } from '@/core/utils/date';
import { DRAFT_MESSAGES } from '@/features/dashboard/domain/entities/charter';
import { DashboardScreen } from '@/features/dashboard/presentation/screens/DashboardScreen';
import { SearchResultsScreen } from '@/features/dashboard/presentation/screens/SearchResultsScreen';

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

test('shows the unread badges, popular routes and the news', async () => {
  await renderWithStore(<DashboardScreen today={TEST_NOW} />);

  expect(await screen.findByTestId('open-messages-badge')).toHaveTextContent(
    '2',
  );
  expect(screen.getByTestId('open-notifications-badge')).toHaveTextContent('2');
  expect(await screen.findByTestId('popular-route-r1')).toHaveTextContent(
    /Geneva → Nice/,
  );
  expect(await screen.findByTestId('news-carousel')).toBeOnTheScreen();
  expect(screen.queryByTestId('jet-results')).toBeNull();
});

test('reports what the form is missing in the snackbar', async () => {
  jest.useFakeTimers();
  try {
    await renderWithStore(<DashboardScreen today={TEST_NOW} />);

    await fireEvent.press(screen.getByTestId('find-jet'));
    expect(screen.getByTestId('snackbar')).toHaveTextContent(
      DRAFT_MESSAGES.noOrigin,
    );

    await act(() => jest.advanceTimersByTime(2000));
    expect(screen.queryByTestId('snackbar')).toBeNull();
  } finally {
    jest.useRealTimers();
  }
});

test('a popular route fills the airports of the form', async () => {
  await renderWithStore(<DashboardScreen today={TEST_NOW} />);

  await fireEvent.press(await screen.findByTestId('popular-route-r2'));

  expect(screen.getByTestId('outbound-origin')).toHaveTextContent(/FAB/);
  expect(screen.getByTestId('outbound-destination')).toHaveTextContent(/LBG/);
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
    origin: 'GVA',
    destination: 'NCE',
  });
  expect(screen.queryByTestId('jet-results')).toBeNull();
});

test('the results screen lists the jets for the search and goes back to edit it', async () => {
  const day = toDayKey(addDays(TEST_NOW, 3));
  const { store } = await renderWithStore(<DashboardScreen today={TEST_NOW} />);
  await fillOneWay(day);
  await fireEvent.press(screen.getByTestId('find-jet'));
  await screen.unmount();

  const onBack = jest.fn();
  await renderWithStore(<SearchResultsScreen onBack={onBack} />, store);

  expect(
    await screen.findByTestId(`jet-card-GVA-NCE-${day}-pilatuspc24`),
  ).toBeOnTheScreen();
  expect(screen.getByTestId('jet-results-count')).toHaveTextContent('6');
  expect(screen.getByTestId('search-summary')).toHaveTextContent(
    /GVA → NCE.*2 pax · One Way/,
  );

  await fireEvent.press(screen.getByTestId('search-summary'));
  expect(onBack).toHaveBeenCalledTimes(1);
});

test('a multi-city leg lists only the jets with room for the whole party', async () => {
  const day = toDayKey(addDays(TEST_NOW, 3));
  const { store } = await renderWithStore(<DashboardScreen today={TEST_NOW} />);

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
  await screen.unmount();

  await renderWithStore(<SearchResultsScreen onBack={jest.fn()} />, store);

  expect(await screen.findByTestId('jet-results-count')).toHaveTextContent('1');
  expect(screen.getByText(/^Leg #1 · GVA → DXB/)).toBeOnTheScreen();
  expect(
    screen.getByTestId(`jet-card-GVA-DXB-${day}-gulfstreamg650er`),
  ).toBeOnTheScreen();
});
