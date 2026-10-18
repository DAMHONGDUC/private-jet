import type { AppNotification, ChatMessage } from '../entities/inbox';

export interface InboxRepository {
  /** Newest first. */
  getNotifications(): Promise<AppNotification[]>;
  markNotificationRead(id: string): Promise<AppNotification[]>;
  markAllNotificationsRead(): Promise<AppNotification[]>;
  /** Oldest first. */
  getMessages(): Promise<ChatMessage[]>;
  /** Adds the member's message, waits for the concierge and returns the whole thread. */
  sendMessage(text: string): Promise<ChatMessage[]>;
  markMessagesRead(): Promise<ChatMessage[]>;
}
