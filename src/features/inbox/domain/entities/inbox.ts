export type NotificationKind = 'flight' | 'offer' | 'account' | 'concierge';

/** Something the member was told: a crew update, an empty leg, a wallet top-up. */
export type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  /** ISO 8601. */
  createdAt: string;
  read: boolean;
  /** The trip it is about, if any; tapping opens it. */
  bookingId?: string;
};

/** One line of the concierge conversation. */
export type ChatMessage = {
  id: string;
  author: 'member' | 'concierge';
  text: string;
  /** ISO 8601. */
  sentAt: string;
  /** Concierge messages start unread; the member's own are always read. */
  read: boolean;
};

/** Counts behind the badges on the home app bar. */
export type InboxSummary = { unreadMessages: number; unreadNotifications: number };

export const MAX_MESSAGE_LENGTH = 1000;

/** The trimmed text, or null when there is nothing to send. */
export function cleanMessage(text: string): string | null {
  const trimmed = text.trim();
  return trimmed.length > 0 ? trimmed.slice(0, MAX_MESSAGE_LENGTH) : null;
}

export function summarize(notifications: AppNotification[], messages: ChatMessage[]): InboxSummary {
  return {
    unreadMessages: messages.filter(message => !message.read).length,
    unreadNotifications: notifications.filter(notification => !notification.read).length,
  };
}

/** Same calendar day as `now`, in local time. */
export function isToday(iso: string, now: Date): boolean {
  return new Date(iso).toDateString() === now.toDateString();
}

/** The concierge's answer to a member's message: matched by topic, a promise to follow up otherwise. */
export function conciergeReplyTo(text: string, firstName = ''): string {
  const lower = text.toLowerCase();
  const name = firstName ? `, ${firstName}` : '';
  if (/(cater|food|menu|meal|drink|champagne|wine)/.test(lower)) {
    return `Of course${name}. Our chef will call you tomorrow to settle the menu; tell me now about any allergies and I will pass them on.`;
  }
  if (/(pet|dog|cat)/.test(lower)) {
    return 'Pets are welcome on charters. I will note the cabin and ask the crew to bring water and a blanket. What size is your companion?';
  }
  if (/(cancel|refund|change|reschedul)/.test(lower)) {
    return 'Changes and cancellations are free until 24 hours before departure. Open the trip under Trips, or tell me which one and I will handle it.';
  }
  if (/(price|quote|cost|how much|cheaper)/.test(lower)) {
    return 'I can hold a quote for 24 hours. Send me the route, the day and the party size, and I will look for empty legs too, which are often 40% less.';
  }
  if (/(car|transfer|chauffeur|pick ?up|driver)/.test(lower)) {
    return 'A chauffeur can meet you at home and drive you to the aircraft steps. Shall I book a Mercedes S-Class for your next departure?';
  }
  if (/(thank|thanks|great|perfect)/.test(lower)) {
    return `My pleasure${name}. I am here around the clock.`;
  }
  return `Noted${name}. I am on it and will confirm within the hour.`;
}
