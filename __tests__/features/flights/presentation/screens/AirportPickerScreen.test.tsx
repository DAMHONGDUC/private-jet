import { act, fireEvent, screen } from '@testing-library/react-native';
import { renderWithStore } from '@test-utils/test-store';
import { originSelected } from '@/features/flights/presentation/flight-search-slice';
import { AirportPickerScreen } from '@/features/flights/presentation/screens/AirportPickerScreen';

test('finds an airport by city and picks it', async () => {
  const onDone = jest.fn();
  const { store } = await renderWithStore(<AirportPickerScreen field="origin" onDone={onDone} />);

  expect(await screen.findByTestId('airport-option-HEL')).toBeOnTheScreen();
  await fireEvent.changeText(screen.getByTestId('airport-search'), 'gen');

  expect(screen.queryByTestId('airport-option-HEL')).not.toBeOnTheScreen();
  await fireEvent.press(screen.getByTestId('airport-option-GVA'));

  expect(store.getState().flightSearch.origin).toBe('GVA');
  expect(onDone).toHaveBeenCalled();
});

test('"Anywhere" clears the destination', async () => {
  const onDone = jest.fn();
  const { store } = await renderWithStore(<AirportPickerScreen field="destination" onDone={onDone} />);
  await act(() => store.dispatch(originSelected('HEL')));

  await fireEvent.press(await screen.findByTestId('airport-option-DXB'));
  expect(store.getState().flightSearch.destination).toBe('DXB');

  await fireEvent.press(screen.getByTestId('airport-option-any'));
  expect(store.getState().flightSearch.destination).toBeNull();
});
