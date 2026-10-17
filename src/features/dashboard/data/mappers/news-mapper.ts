import type { NewsPost } from '../../domain/entities/dashboard';
import type { NewsPostDto } from '../models/news-post-dto';

export function toNewsPost(dto: NewsPostDto): NewsPost {
  return {
    id: dto.id,
    title: dto.fieldData['meta-title'],
    summary: dto.fieldData.summery,
    body: dto.fieldData['post-body'] ?? dto.fieldData.summery,
    image: dto.fieldData['main-image'].key,
    status: dto.isArchived ? 'archived' : dto.isDraft ? 'draft' : 'published',
  };
}
