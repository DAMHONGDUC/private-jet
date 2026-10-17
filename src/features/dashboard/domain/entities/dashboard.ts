/** A story for the dashboard's carousel. */
export type NewsPost = {
  id: string;
  title: string;
  summary: string;
  /** Key of a bundled image. */
  image: string;
  status: 'published' | 'draft' | 'archived';
};

/** The most stories the carousel shows. */
export const MAX_NEWS_POSTS = 5;
