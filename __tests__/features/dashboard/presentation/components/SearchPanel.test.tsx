import { fireEvent, screen } from '@testing-library/react-native';
import { TEST_NOW, renderWithStore } from '@test-utils/test-store';
import { addDays, toDayKey } from '@/core/utils/date';
import {
  DRAFT_MESSAGES,
  TripType,
} from '@/features/dashboard/domain/entities/charter';
import { SearchPanel } from '@/features/dashboard/presentation/components/SearchPanel';

function setup() {
  const props = { onSearch: jest.fn(), onInvalid: jest.fn() };
  const render = () =>
    renderWithStore(<SearchPanel {...props} today={TEST_NOW} />);
  return { props, render };
}

async function pickAirport(field: string, code: string) {
  await fireEvent.press(screen.getByTestId(field));
  await fireEvent.press(await screen.findByTestId(`airport-option-${code}`));
}

test('names what is missing, then searches once the form is complete', async () => {
  const { props, render } = setup();
  await render();
  const day = toDayKey(addDays(TEST_NOW, 3));

  await fireEvent.press(screen.getByTestId('find-jet'));
  expect(props.onInvalid).toHaveBeenLastCalledWith(DRAFT_MESSAGES.noOrigin);

  await pickAirport('outbound-origin', 'SYD');
  await pickAirport('outbound-destination', 'MEB');
  expect(screen.getByTestId('outbound-origin')).toHaveTextContent(
    'FromSYDSydney',
  );

  await fireEvent.press(screen.getByTestId('find-jet'));
  expect(props.onInvalid).toHaveBeenLastCalledWith(DRAFT_MESSAGES.noDate);

  await fireEvent.press(screen.getByTestId('outbound-date'));
  expect(
    screen.getByTestId(`calendar-${toDayKey(addDays(TEST_NOW, -1))}`),
  ).toBeDisabled();
  await fireEvent.press(screen.getByTestId(`calendar-${day}`));

  await fireEvent.press(screen.getByTestId('outbound-passengers'));
  await fireEvent.press(screen.getByTestId('count-increment'));
  await fireEvent.press(screen.getByTestId('count-done'));
  expect(screen.getByTestId('outbound-passengers')).toHaveTextContent(
    /2 guests$/,
  );

  await fireEvent.press(screen.getByTestId('find-jet'));
  expect(props.onSearch).toHaveBeenCalledWith({
    tripType: TripType.OneWay,
    legs: [{ origin: 'SYD', destination: 'MEB', date: day, passengers: 2 }],
  });
});

test('asks for the way back on a round trip', async () => {
  const { props, render } = setup();
  await render();

  expect(screen.queryByTestId('return-date')).toBeNull();
  await fireEvent.press(screen.getByTestId('trip-type-roundTrip'));

  expect(screen.getByTestId('return-date')).toHaveTextContent(/Return$/);
  expect(screen.getByTestId('trip-type-roundTrip')).toBeChecked();
  expect(props.onInvalid).not.toHaveBeenCalled();
});

test('adds multi-city legs and removes one after confirming', async () => {
  const { render } = setup();
  await render();

  await fireEvent.press(screen.getByTestId('trip-type-multiCity'));
  await pickAirport('leg-0-destination', 'MEB');
  await fireEvent.press(screen.getByTestId('add-leg'));

  expect(screen.getByTestId('leg-1-origin')).toHaveTextContent(
    'FromMEBMelbourne',
  );

  await fireEvent.press(screen.getByTestId('leg-1-remove'));
  await fireEvent.press(screen.getByTestId('confirm-ok'));

  expect(screen.queryByTestId('leg-1')).toBeNull();
  expect(screen.queryByTestId('leg-0-remove')).toBeNull();
});

test('the airport search waits for a tap before it takes the keyboard', async () => {
  const { render } = setup();
  await render();

  await fireEvent.press(screen.getByTestId('outbound-origin'));

  const search = await screen.findByTestId('airport-search');
  expect(search.props.autoFocus).toBeFalsy();
});
