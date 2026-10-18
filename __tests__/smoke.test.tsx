import { fireEvent, render, screen } from '@testing-library/react-native';
import App from '@/app/App';
import { createTestStore } from '@test-utils/test-store';

test('opens the concierge, a notification and a story from home', async () => {
  await render(<App store={createTestStore()} />);

  expect(await screen.findByTestId('open-messages-badge')).toHaveTextContent(
    '2',
  );
  await fireEvent.press(screen.getByTestId('open-messages'));
  expect(await screen.findByTestId('chat-input')).toBeOnTheScreen();
  await fireEvent.press(screen.getByTestId('quick-reply-0'));
  expect(await screen.findByText(/Our chef will call you/)).toBeOnTheScreen();
});

test('a notification about a trip opens it', async () => {
  await render(<App store={createTestStore()} />);

  await fireEvent.press(await screen.findByTestId('open-notifications'));
  await fireEvent.press(await screen.findByTestId('notification-nt-1'));
  expect(await screen.findByTestId('trip-reference')).toHaveTextContent(
    'BJ4F7Q',
  );
});

test('a story in the carousel opens in full', async () => {
  await render(<App store={createTestStore()} />);

  // The pager draws its photos once it knows its width.
  await fireEvent(await screen.findByTestId('news-pager'), 'layout', {
    nativeEvent: { layout: { x: 0, y: 0, width: 390, height: 220 } },
  });
  await fireEvent.press(screen.getByTestId('news-pager-item-0'));
  expect(await screen.findByTestId('news-detail-title')).toHaveTextContent(
    'Overnight to Singapore',
  );
  expect(screen.getByText(/Global 6500/)).toBeOnTheScreen();
});
