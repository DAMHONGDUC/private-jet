import { AppErrorCode, DomainError } from '@/core/error/app-error';
import {
  cleanMessage,
  summarize,
  type AppNotification,
  type ChatMessage,
  type InboxSummary,
} from '../entities/inbox';
import type { InboxRepository } from '../repositories/inbox-repository';

export class GetInboxSummary {
  constructor(private readonly repository: InboxRepository) {}

  async execute(): Promise<InboxSummary> {
    const [notifications, messages] = await Promise.all([
      this.repository.getNotifications(),
      this.repository.getMessages(),
    ]);
    return summarize(notifications, messages);
  }
}

export class GetNotifications {
  constructor(private readonly repository: InboxRepository) {}

  async execute(): Promise<AppNotification[]> {
    const notifications = await this.repository.getNotifications();
    return [...notifications].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  }
}

export class MarkNotificationRead {
  constructor(private readonly repository: InboxRepository) {}

  /** No id marks every notification read. */
  execute(id?: string): Promise<AppNotification[]> {
    return id
      ? this.repository.markNotificationRead(id)
      : this.repository.markAllNotificationsRead();
  }
}

export class GetMessages {
  constructor(private readonly repository: InboxRepository) {}

  async execute(): Promise<ChatMessage[]> {
    const messages = await this.repository.getMessages();
    return [...messages].sort((a, b) => a.sentAt.localeCompare(b.sentAt));
  }
}

export class SendMessage {
  constructor(private readonly repository: InboxRepository) {}

  async execute(text: string): Promise<ChatMessage[]> {
    const message = cleanMessage(text);
    if (!message) {
      throw new DomainError(AppErrorCode.Validation, 'Write a message first.');
    }
    return this.repository.sendMessage(message);
  }
}

export class MarkMessagesRead {
  constructor(private readonly repository: InboxRepository) {}

  execute(): Promise<ChatMessage[]> {
    return this.repository.markMessagesRead();
  }
}
