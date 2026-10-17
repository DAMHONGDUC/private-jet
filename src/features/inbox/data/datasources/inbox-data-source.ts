import type { AppNotification, ChatMessage } from '../../domain/entities/inbox';

/** The inbox backend. The mock speaks domain shapes; an HTTP source would map its DTOs here. */
export interface InboxDataSource {
  getNotifications(): Promise<AppNotification[]>;
  markNotificationsRead(ids: string[] | 'all'): Promise<AppNotification[]>;
  getMessages(): Promise<ChatMessage[]>;
  sendMessage(text: string): Promise<ChatMessage[]>;
  markMessagesRead(): Promise<ChatMessage[]>;
}
