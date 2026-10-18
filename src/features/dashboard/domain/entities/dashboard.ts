/** A story for the dashboard's carousel. */
export type NewsPost = {
  id: string;
  title: string;
  summary: string;
  /** The full story, paragraphs separated by blank lines. */
  body: string;
  /** Key of a bundled image. */
  image: string;
  status: 'published' | 'draft' | 'archived';
};

/** The most stories the carousel shows. */
export const MAX_NEWS_POSTS = 5;

/** A route members often fly, suggested under the search. */
export type PopularRoute = {
  id: string;
  /** IATA codes. */
  origin: string;
  destination: string;
  originCity: string;
  destinationCity: string;
  /** Typical flight time, in minutes. */
  durationMinutes: number;
  /** The lowest whole-aircraft price, in `currency`. */
  fromPrice: number;
  currency: string;
  /** Key of a bundled image. */
  image: string;
};

/** The most routes the dashboard suggests. */
export const MAX_POPULAR_ROUTES = 4;
