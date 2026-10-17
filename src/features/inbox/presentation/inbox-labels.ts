import type { IconName } from '@/core/ui/Icon';
import type { NotificationKind } from '../domain/entities/inbox';

export const KIND_ICONS: Record<NotificationKind, IconName> = {
  flight: 'plane',
  offer: 'calendar',
  account: 'ticket',
  concierge: 'chat',
};

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "Just now", "12 min ago", "3 h ago", "Yesterday", "Tue 6 Oct". */
export function timeAgo(iso: string, now: Date): string {
  const elapsed = now.getTime() - new Date(iso).getTime();
  if (elapsed < MINUTE) {
    return 'Just now';
  }
  if (elapsed < HOUR) {
    return `${Math.floor(elapsed / MINUTE)} min ago`;
  }
  if (elapsed < DAY) {
    return `${Math.floor(elapsed / HOUR)} h ago`;
  }
  if (elapsed < 2 * DAY) {
    return 'Yesterday';
  }
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

/** "14:05", for chat bubbles. */
export function clockTime(iso: string): string {
  const date = new Date(iso);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}
