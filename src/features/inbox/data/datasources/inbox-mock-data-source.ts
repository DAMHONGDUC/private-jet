import { NotificationScope } from '@/features/inbox/data/datasources/inbox-data-source';
import { delay } from '@/core/utils/delay';
import {
  conciergeReplyTo,
  MessageAuthor,
  type AppNotification,
  type ChatMessage,
} from '../../domain/entities/inbox';
import type { InboxDataSource } from './inbox-data-source';
import { buildMockMessages, buildMockNotifications } from './mock/inbox.mock';

/**
 * In-memory inbox with a fake network delay. The concierge answers every
 * message after twice the latency, by topic.
 */
export class InboxMockDataSource implements InboxDataSource {
  private notifications: AppNotification[];
  private messages: ChatMessage[];
  private sequence = 0;

  constructor(
    private readonly latencyMs = 700,
    private readonly now: () => Date = () => new Date(),
    private readonly memberFirstName = 'Alexander',
  ) {
    this.notifications = buildMockNotifications(now());
    this.messages = buildMockMessages(now());
  }

  async getNotifications(): Promise<AppNotification[]> {
    await delay(this.latencyMs);
    return this.notifications.map(item => ({ ...item }));
  }

  async markNotificationsRead(
    ids: string[] | NotificationScope.All,
  ): Promise<AppNotification[]> {
    await delay(this.latencyMs / 2);
    this.notifications = this.notifications.map(item =>
      ids === NotificationScope.All || ids.includes(item.id)
        ? { ...item, read: true }
        : item,
    );
    return this.notifications.map(item => ({ ...item }));
  }

  async getMessages(): Promise<ChatMessage[]> {
    await delay(this.latencyMs);
    return this.messages.map(item => ({ ...item }));
  }

  async sendMessage(text: string): Promise<ChatMessage[]> {
    this.messages = [
      ...this.messages,
      this.message(MessageAuthor.Member, text),
    ];
    // The concierge "types" for a moment.
    await delay(this.latencyMs * 2);
    // Read at once: the member is looking at the conversation.
    this.messages = [
      ...this.messages,
      this.message(
        MessageAuthor.Concierge,
        conciergeReplyTo(text, this.memberFirstName),
      ),
    ];
    return this.messages.map(item => ({ ...item }));
  }

  async markMessagesRead(): Promise<ChatMessage[]> {
    await delay(this.latencyMs / 2);
    this.messages = this.messages.map(item => ({ ...item, read: true }));
    return this.messages.map(item => ({ ...item }));
  }

  private message(author: ChatMessage['author'], text: string): ChatMessage {
    this.sequence += 1;
    return {
      id: `msg-new-${this.sequence}`,
      author,
      text,
      sentAt: this.now().toISOString(),
      read: true,
    };
  }
}
