import { fireEvent, render, screen } from '@testing-library/react-native';
import App from '@/app/App';
import { createTestStore } from '@test-utils/test-store';

test('books a flight from the dashboard to the confirmation', async () => {
  await render(<App store={createTestStore()} />);

  expect(await screen.findByTestId('dashboard-greeting')).toHaveTextContent('Welcome back, Duc');
  expect(screen.getByTestId('stat-upcoming')).toHaveTextContent(/^1/);

  await fireEvent.press(screen.getByTestId('find-flights'));
  await fireEvent.press(await screen.findByTestId('flight-card-BJ-101'));
  await fireEvent.press(await screen.findByTestId('book-button'));

  await fireEvent.changeText(await screen.findByTestId('passenger-name-0'), 'Duc Dam');
  await fireEvent.changeText(screen.getByTestId('contact-email'), 'duc@example.com');
  await fireEvent.press(screen.getByTestId('confirm-booking'));

  expect(await screen.findByTestId('booking-reference')).toHaveTextContent(/^BJ[A-Z0-9]{4}$/);
});
