import { act, fireEvent, screen } from '@testing-library/react-native';
import {
  TEST_NOW,
  createTestDependencies,
  createTestStore,
  renderWithStore,
} from '@test-utils/test-store';
import {
  MessageAuthor,
  conciergeReplyTo,
  summarize,
} from '@/features/inbox/domain/entities/inbox';
import { inboxApi } from '@/features/inbox/presentation/inbox-api';
import {
  CHAT_POLL_MS,
  ChatScreen,
} from '@/features/inbox/presentation/screens/ChatScreen';
import { NotificationsScreen } from '@/features/inbox/presentation/screens/NotificationsScreen';

test('the concierge answers by topic', () => {
  expect(conciergeReplyTo('Can we get sushi and champagne?')).toMatch(/chef/);
  expect(conciergeReplyTo('I want to bring my dog')).toMatch(
    /Pets are welcome/,
  );
  expect(conciergeReplyTo('How do I cancel?')).toMatch(/24 hours/);
  expect(conciergeReplyTo('Hello', 'Alexander')).toBe(
    'Noted, Alexander. I am on it and will confirm within the hour.',
  );
});

test('counts unread notifications and concierge messages', async () => {
  const store = createTestStore();
  const before = store.dispatch(inboxApi.endpoints.getInboxSummary.initiate());
  expect((await before).data).toEqual({
    unreadMessages: 2,
    unreadNotifications: 2,
  });
  // Unsubscribed, so the mutations below do not race a refetch.
  before.unsubscribe();

  await store.dispatch(
    inboxApi.endpoints.markNotificationRead.initiate('nt-1'),
  );
  await store.dispatch(inboxApi.endpoints.markMessagesRead.initiate());
  const after = await store.dispatch(
    inboxApi.endpoints.getInboxSummary.initiate(undefined, {
      forceRefetch: true,
    }),
  );
  expect(after.data).toEqual({ unreadMessages: 0, unreadNotifications: 1 });
  expect(summarize([], [])).toEqual({
    unreadMessages: 0,
    unreadNotifications: 0,
  });
});

test('rejects an empty message', async () => {
  const store = createTestStore();
  const result = await store.dispatch(
    inboxApi.endpoints.sendMessage.initiate('   '),
  );
  expect(result.error).toEqual({
    code: 'VALIDATION',
    message: 'Write a message first.',
  });
});

test('reads a notification and opens its trip', async () => {
  const onOpenTrip = jest.fn();
  await renderWithStore(
    <NotificationsScreen onOpenTrip={onOpenTrip} now={TEST_NOW} />,
  );

  expect(await screen.findByText('Today')).toBeOnTheScreen();
  expect(screen.getByText('2 unread')).toBeOnTheScreen();
  expect(screen.getByTestId('unread-nt-1')).toBeOnTheScreen();

  await fireEvent.press(screen.getByTestId('notification-nt-1'));
  expect(onOpenTrip).toHaveBeenCalledWith('bk-seed-1');
  expect(screen.queryByTestId('unread-nt-1')).toBeNull();

  await fireEvent.press(screen.getByTestId('mark-all-read'));
  expect(await screen.findByText('Earlier')).toBeOnTheScreen();
  expect(screen.queryByTestId('unread-nt-2')).toBeNull();
});

test('sends a message and gets the concierge reply', async () => {
  const store = createTestStore();
  await renderWithStore(<ChatScreen />, store);

  expect(
    await screen.findByText(/Sophie, your Sovereign concierge/),
  ).toBeOnTheScreen();
  expect(screen.queryByTestId('chat-send')).toBeNull();

  await fireEvent.changeText(
    screen.getByTestId('chat-input'),
    'Could you book a car to the airport?',
  );
  await fireEvent.press(screen.getByTestId('chat-send'));

  expect(await screen.findByText(/Mercedes S-Class/)).toBeOnTheScreen();
  expect(
    screen.getByText('Could you book a car to the airport?'),
  ).toBeOnTheScreen();
  expect(screen.getByTestId('chat-input').props.value).toBe('');

  await fireEvent.press(screen.getByTestId('quick-reply-2'));
  expect(
    await screen.findByText(/What size is your companion/),
  ).toBeOnTheScreen();

  const summary = await store.dispatch(
    inboxApi.endpoints.getInboxSummary.initiate(undefined, {
      forceRefetch: true,
    }),
  );
  expect(summary.data?.unreadMessages).toBe(0);
});

test('the open chat polls, so a reply that arrives later shows up', async () => {
  jest.useFakeTimers();
  try {
    const dependencies = createTestDependencies();
    const thread = dependencies.getMessages.execute.bind(
      dependencies.getMessages,
    );
    let replied = false;
    jest.spyOn(dependencies.getMessages, 'execute').mockImplementation(
      async () => [
        ...(await thread()),
        ...(replied
          ? [
              {
                id: 'msg-late',
                author: MessageAuthor.Concierge,
                text: 'Your car is confirmed.',
                sentAt: TEST_NOW.toISOString(),
                read: true,
              },
            ]
          : []),
      ],
    );
    await renderWithStore(<ChatScreen />, createTestStore(dependencies));
    expect(
      await screen.findByText(/Sophie, your Sovereign concierge/),
    ).toBeOnTheScreen();

    replied = true;
    await act(() => jest.advanceTimersByTimeAsync(CHAT_POLL_MS));

    expect(await screen.findByText('Your car is confirmed.')).toBeOnTheScreen();
  } finally {
    jest.useRealTimers();
  }
});
