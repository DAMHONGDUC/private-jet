/** A story shaped like the Webflow CMS items the original app reads. */
export type NewsPostDto = {
  id: string;
  isArchived: boolean;
  isDraft: boolean;
  fieldData: {
    'meta-title': string;
    /** Spelled as in the CMS. */
    summery: string;
    'main-image': { key: string };
  };
};
