import { AppErrorCode, DomainError } from '@/core/error/app-error';
import type { AppNotification, ChatMessage } from '../../domain/entities/inbox';
import type { InboxRepository } from '../../domain/repositories/inbox-repository';
import {
  NotificationScope,
  type InboxDataSource,
} from '../datasources/inbox-data-source';

export class InboxRepositoryImpl implements InboxRepository {
  constructor(private readonly dataSource: InboxDataSource) {}

  getNotifications(): Promise<AppNotification[]> {
    return this.dataSource.getNotifications();
  }

  async markNotificationRead(id: string): Promise<AppNotification[]> {
    const notifications = await this.dataSource.markNotificationsRead([id]);
    if (!notifications.some(item => item.id === id)) {
      throw new DomainError(
        AppErrorCode.NotFound,
        'This notification no longer exists.',
      );
    }
    return notifications;
  }

  markAllNotificationsRead(): Promise<AppNotification[]> {
    return this.dataSource.markNotificationsRead(NotificationScope.All);
  }

  getMessages(): Promise<ChatMessage[]> {
    return this.dataSource.getMessages();
  }

  sendMessage(text: string): Promise<ChatMessage[]> {
    return this.dataSource.sendMessage(text);
  }

  markMessagesRead(): Promise<ChatMessage[]> {
    return this.dataSource.markMessagesRead();
  }
}
