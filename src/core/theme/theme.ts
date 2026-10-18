/** Every gap is on the 4/8 pt grid. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/** The only four text sizes in the app. */
export const typeScale = {
  display: 28,
  title: 20,
  body: 16,
  caption: 13,
} as const;

export type TypeSize = (typeof typeScale)[keyof typeof typeScale];

/** One timing for every press, so the app moves the same everywhere. */
export const pressTiming = { duration: 120 } as const;

/** Soft, background-tinted lift for floating surfaces. */
export const elevation = (color: string) =>
  ({
    shadowColor: color,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  } as const);
