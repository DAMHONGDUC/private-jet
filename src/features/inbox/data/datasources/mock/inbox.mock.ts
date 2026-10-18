import {
  MessageAuthor,
  NotificationKind,
  type AppNotification,
  type ChatMessage,
} from '../../../domain/entities/inbox';

const HOUR = 60 * 60 * 1000;
const ago = (now: Date, hours: number) =>
  new Date(now.getTime() - hours * HOUR).toISOString();

/** Notifications about the seeded trips and wallet (see booking's bookings.mock.ts). */
export function buildMockNotifications(now: Date): AppNotification[] {
  return [
    {
      id: 'nt-1',
      kind: NotificationKind.Flight,
      title: 'Your crew for Sydney → Melbourne',
      body: 'Captain Laura Mitchell and First Officer Tom Nguyen will fly you. Boarding opens 15 minutes before departure.',
      createdAt: ago(now, 1),
      read: false,
      bookingId: 'bk-seed-1',
    },
    {
      id: 'nt-2',
      kind: NotificationKind.Offer,
      title: 'Empty leg: Melbourne → Queenstown',
      body: 'A Citation Latitude repositions on Friday. Eight seats, the whole aircraft, from $11,400.',
      createdAt: ago(now, 3),
      read: false,
    },
    {
      id: 'nt-3',
      kind: NotificationKind.Concierge,
      title: 'Sophie answered about catering',
      body: 'Your menu for the Hamilton Island round trip is confirmed: sashimi, a cheese board and Krug.',
      createdAt: ago(now, 26),
      read: true,
      bookingId: 'bk-seed-2',
    },
    {
      id: 'nt-4',
      kind: NotificationKind.Account,
      title: 'Wallet topped up',
      body: '$40,000 was added to your Sovereign Wallet. It pays for any booking at checkout.',
      createdAt: ago(now, 72),
      read: true,
    },
    {
      id: 'nt-5',
      kind: NotificationKind.Flight,
      title: 'Welcome home from the Gold Coast',
      body: 'We hope the flight was perfect. Tell your concierge anything we could do better.',
      createdAt: ago(now, 24 * 9),
      read: true,
      bookingId: 'bk-seed-3',
    },
  ];
}

export function buildMockMessages(now: Date): ChatMessage[] {
  return [
    {
      id: 'msg-1',
      author: MessageAuthor.Concierge,
      text: 'Good evening, I am Sophie, your Sovereign concierge. Anything you need before or after a flight, ask me here.',
      sentAt: ago(now, 30),
      read: true,
    },
    {
      id: 'msg-2',
      author: MessageAuthor.Member,
      text: 'Could we have sashimi and champagne on the Hamilton Island round trip?',
      sentAt: ago(now, 27),
      read: true,
    },
    {
      id: 'msg-3',
      author: MessageAuthor.Concierge,
      text: 'Done: sashimi from Sokyo, a cheese board and Krug Grande Cuvée, for three.',
      sentAt: ago(now, 26),
      read: false,
    },
    {
      id: 'msg-4',
      author: MessageAuthor.Concierge,
      text: 'Would you like a transfer from qualia to the aircraft on Hamilton Island? I can hold a buggy for you and your bags.',
      sentAt: ago(now, 2),
      read: false,
    },
  ];
}
