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
  fieldData: {
    'meta-title': title,
    summery: summary,
    'main-image': { key: image },
    ...(BODIES[id] ? { 'post-body': BODIES[id] } : {}),
  },
});

const BODIES: Record<string, string> = {
  n1: `From November, a Challenger 650 leaves Geneva at 22:30 every Thursday and Sunday. Dinner is served after take-off, the cabin lights dim, and the flat beds are made up over the Alps.

You land in Dubai at 07:15 local time, rested and ahead of the traffic. A car waits at the steps, and your bags go straight to the hotel.

Seats on the shared flight start at €4,900. Charter the whole aircraft any night of the week from the Home tab.`,
  n2: `Private terminals are built for people who would rather not wait. Arrive fifteen minutes before departure, hand your passport to the host, and walk to the aircraft while your luggage is loaded.

Security and passport control happen in a quiet room with no queue. Pets, golf bags and skis go with you, not to a carousel.

Every BlackJet booking includes the private terminal at both ends.`,
  n3: `Our Farnborough lounge opens on 1 December: six private suites with showers, a cocktail bar run by the team from Annabel's, and floor-to-ceiling windows over the ramp.

Members can book a suite for free on the day of any departure from Farnborough, and guests are always welcome.`,
  n5: `From June to September we fly Geneva, Farnborough and Le Bourget to Nice and Olbia every Friday, and back every Sunday evening.

Shared seats open sixty days ahead. Book a whole aircraft for the long weekend now; Riviera slots fill early.`,
  n7: `Dogs and cats of every size travel in the cabin with you on every charter, with no crate and no paperwork beyond their passport.

Tell your concierge their name and the crew will bring a bed, a bowl and treats on board.`,
  n8: `Choose your menu when you book, or ask the concierge for anything at all: sushi from Nobu, a birthday cake, your favourite vintage.

Our chefs work with the best kitchens at every airport we fly from, so dinner is fresh, not reheated.`,
};

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
