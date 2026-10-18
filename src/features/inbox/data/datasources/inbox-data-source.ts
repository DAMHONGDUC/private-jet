import type { AppNotification, ChatMessage } from '../../domain/entities/inbox';

/** Which notifications a call is about, when it is not a list of ids. */
export enum NotificationScope {
  All = 'all',
}

/** The inbox backend. The mock speaks domain shapes; an HTTP source would map its DTOs here. */
export interface InboxDataSource {
  getNotifications(): Promise<AppNotification[]>;
  markNotificationsRead(
    ids: string[] | NotificationScope.All,
  ): Promise<AppNotification[]>;
  getMessages(): Promise<ChatMessage[]>;
  /**
   * The thread once the backend has the message. The mock adds the
   * concierge's reply before it returns; a real backend answers later, and
   * the open chat polls `getMessages` for it.
   */
  sendMessage(text: string): Promise<ChatMessage[]>;
  markMessagesRead(): Promise<ChatMessage[]>;
}
