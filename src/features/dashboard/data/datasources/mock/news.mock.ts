import type { NewsPostDto } from '../../models/news-post-dto';

const post = (
  id: string,
  title: string,
  summary: string,
  image: string,
  flags: { isDraft?: boolean; isArchived?: boolean } = {},
): NewsPostDto => ({
  id,
  isDraft: flags.isDraft ?? false,
  isArchived: flags.isArchived ?? false,
  fieldData: { 'meta-title': title, summery: summary, 'main-image': { key: image } },
});

export function buildMockNews(): NewsPostDto[] {
  return [
    post('n1', 'Night departures to Dubai', 'Leave Geneva after dinner and land for breakfast on the Gulf.', 'news-1'),
    post('n2', 'Skip the terminal', 'Arrive fifteen minutes before wheels up and walk straight to the stairs.', 'news-2'),
    post('n3', 'Our new Farnborough lounge', 'Private suites, a cocktail bar and a view of the ramp.', 'news-3'),
    post('n4', 'Draft: winter schedule', 'Not ready yet.', 'news-4', { isDraft: true }),
    post('n5', 'Summer on the Riviera', 'Nice and Olbia every weekend from June to September.', 'news-4'),
    post('n6', 'Archived: 2025 recap', 'Last year in numbers.', 'news-1', { isArchived: true }),
    post('n7', 'Flying with your pets', 'Cabins that welcome dogs and cats of every size.', 'news-2'),
    post('n8', 'Catering by request', 'Tell us your menu; the chef meets you on board.', 'news-3'),
  ];
}
