// Gaps live in `AppSpacing` (app-spacing.ts), colours in `AppColors` (app-colors.ts).

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

/** The only text sizes in the app; `label` is the small tracked capitals. */
export const typeScale = {
  display: 28,
  title: 20,
  body: 16,
  caption: 13,
  label: 11,
} as const;

export type TypeSize = (typeof typeScale)[keyof typeof typeScale];

/** One timing for every press, so the app moves the same everywhere. */
export const pressTiming = { duration: 120 } as const;

/** Content changing in place: a segment sliding over, a field arriving or leaving. */
export const switchTiming = { duration: 260 } as const;

/** Soft, background-tinted lift for floating surfaces. */
export const elevation = (color: string) =>
  ({
    shadowColor: color,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  } as const);
