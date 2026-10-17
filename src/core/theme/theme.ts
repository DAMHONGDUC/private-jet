export const colors = {
  background: '#0B1120',
  surface: '#131C31',
  surfaceRaised: '#1B2640',
  border: '#24314F',
  gold: '#D4AF37',
  goldSoft: 'rgba(212, 175, 55, 0.14)',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  success: '#34D399',
  danger: '#F87171',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

/** One spring for every press and pop, so the app moves the same everywhere. */
export const pressTiming = { duration: 120 } as const;
