import type { AppNotification, ChatMessage } from '../../../domain/entities/inbox';

const HOUR = 60 * 60 * 1000;
const ago = (now: Date, hours: number) => new Date(now.getTime() - hours * HOUR).toISOString();

/** Notifications about the seeded trips and wallet (see booking's bookings.mock.ts). */
export function buildMockNotifications(now: Date): AppNotification[] {
  return [
    {
      id: 'nt-1',
      kind: 'flight',
      title: 'Your crew for Geneva → Nice',
      body: 'Captain Laura Meier and First Officer Tom Brandt will fly you. Boarding opens 15 minutes before departure.',
      createdAt: ago(now, 1),
      read: false,
      bookingId: 'bk-seed-1',
    },
    {
      id: 'nt-2',
      kind: 'offer',
      title: 'Empty leg: Farnborough → Ibiza',
      body: 'A Citation Latitude repositions on Friday. Eight seats, the whole aircraft, from €6,900.',
      createdAt: ago(now, 3),
      read: false,
    },
    {
      id: 'nt-3',
      kind: 'concierge',
      title: 'Sophie answered about catering',
      body: 'Your menu for the Nice round trip is confirmed: sushi, a cheese board and Ruinart.',
      createdAt: ago(now, 26),
      read: true,
      bookingId: 'bk-seed-2',
    },
    {
      id: 'nt-4',
      kind: 'account',
      title: 'Wallet topped up',
      body: '€25,000 was added to your BlackJet Wallet. It pays for any booking at checkout.',
      createdAt: ago(now, 72),
      read: true,
    },
    {
      id: 'nt-5',
      kind: 'flight',
      title: 'Welcome home from Olbia',
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
      author: 'concierge',
      text: 'Good evening, I am Sophie, your BlackJet concierge. Anything you need before or after a flight, ask me here.',
      sentAt: ago(now, 30),
      read: true,
    },
    {
      id: 'msg-2',
      author: 'member',
      text: 'Could we have sushi and champagne on the Nice round trip?',
      sentAt: ago(now, 27),
      read: true,
    },
    {
      id: 'msg-3',
      author: 'concierge',
      text: 'Done: sushi from Nobu, a cheese board and Ruinart Blanc de Blancs, for four.',
      sentAt: ago(now, 26),
      read: false,
    },
    {
      id: 'msg-4',
      author: 'concierge',
      text: 'Would you like a car from your hotel to the aircraft in Nice? I can hold a Mercedes V-Class.',
      sentAt: ago(now, 2),
      read: false,
    },
  ];
}
