import type { Inbox, NewsPost } from '../../domain/entities/dashboard';
import type { InboxDto } from '../models/inbox-dto';
import type { NewsPostDto } from '../models/news-post-dto';

export function toNewsPost(dto: NewsPostDto): NewsPost {
  return {
    id: dto.id,
    title: dto.fieldData['meta-title'],
    summary: dto.fieldData.summery,
    image: dto.fieldData['main-image'].key,
    status: dto.isArchived ? 'archived' : dto.isDraft ? 'draft' : 'published',
  };
}

export function toInbox(dto: InboxDto): Inbox {
  return { unreadMessages: dto.unread_messages, unreadNotifications: dto.unread_notifications };
}
