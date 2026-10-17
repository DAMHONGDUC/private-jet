import { fireEvent, render, screen } from '@testing-library/react-native';
import App from '@/app/App';
import { createTestStore } from '@test-utils/test-store';

test('books a shared flight and opens it from the confirmation', async () => {
  await render(<App store={createTestStore()} />);

  expect(await screen.findByTestId('booking-card')).toBeOnTheScreen();

  await fireEvent.press(screen.getByTestId('tab-FlightsTab'));
  await fireEvent.press(await screen.findByTestId('search-flights'));
  await fireEvent.press(await screen.findByTestId('flight-card-BJ-101'));
  await fireEvent.press(await screen.findByTestId('book-button'));

  await fireEvent.changeText(await screen.findByTestId('passenger-name-0'), 'Alexander Reed');
  await fireEvent.changeText(screen.getByTestId('contact-email'), 'demo@blackjet.app');
  await fireEvent.press(screen.getByTestId('confirm-booking'));

  const reference = await screen.findByTestId('booking-reference');
  expect(reference).toHaveTextContent(/^BJ[A-Z0-9]{4}$/);
  const code = String(reference.props.children);

  await fireEvent.press(screen.getByTestId('view-trip'));
  expect(await screen.findByTestId('trip-reference')).toHaveTextContent(code);
});
