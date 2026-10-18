export enum ColorScheme {
  Light = 'light',
  Dark = 'dark',
}

/** Every colour a screen may use, by role rather than by hue. */
export type AppPalette = {
  primaryText: string;
  secondaryText: string;
  primaryBackground: string;
  secondaryBackground: string;
  /** Black on light, white on dark: icons and the main button. */
  jetBlack: string;
  /** The opposite of `jetBlack`: text on the main button. */
  ghostWhite: string;
  iron: string;
  ashGrey: string;
  permanentAsh: string;
  info: string;
  error: string;
  cardBackground: string;
  loadStateColour: string;
  shimmerColour: string;
  success: string;
  /** The one brand colour, about a tenth of any screen: the main button, selection, key icons. */
  accent: string;
  /** Text and icons on `accent`. */
  onAccent: string;
  /** `accent` washed out: selected rows, secondary highlights. */
  accentSoft: string;
  /** The main button and other solid calls to action: ink, never gold, so gold stays a detail. */
  primaryAction: string;
  /** Text and icons on `primaryAction`. */
  onPrimaryAction: string;
  /** Surfaces that float over the screen: the search card, pills, the selected segment. */
  raised: string;
  /** Soft shadow tinted to the background. */
  shadow: string;
  /** Translucent backdrop behind sheets and dialogs. */
  scrim: string;
  scheme: ColorScheme;
};

/**
 * The one owner of the app's colours: warm neutrals, near-black text and one
 * champagne accent (60/30/10), in a light and a dark palette. Screens read
 * the palette for the current scheme through `useBlackJetTheme()`.
 */
export class AppColors {
  static readonly light: AppPalette = {
    primaryText: '#17150F',
    secondaryText: '#7A746B',
    primaryBackground: '#F2EEE7',
    secondaryBackground: '#FAF8F4',
    jetBlack: '#17150F',
    ghostWhite: '#FFFFFF',
    iron: '#E6DFD3',
    ashGrey: '#B8B1A6',
    permanentAsh: '#55555A',
    info: '#FFFFFF',
    error: '#D93A3A',
    cardBackground: '#FFFFFF',
    loadStateColour: '#B8B1A6',
    shimmerColour: '#ECE6DC',
    success: '#2F7A6B',
    accent: '#B8925A',
    onAccent: '#16120A',
    accentSoft: 'rgba(184, 146, 90, 0.12)',
    primaryAction: '#17150F',
    onPrimaryAction: '#FAF8F4',
    raised: '#FFFFFF',
    shadow: 'rgba(70, 54, 28, 0.10)',
    scrim: 'rgba(17, 17, 19, 0.45)',
    scheme: ColorScheme.Light,
  };

  static readonly dark: AppPalette = {
    primaryText: '#F3EFE7',
    secondaryText: '#A59E93',
    primaryBackground: '#1F1C18',
    secondaryBackground: '#0F0E0C',
    jetBlack: '#F3EFE7',
    ghostWhite: '#0F0E0C',
    iron: '#2E2A24',
    ashGrey: '#55555A',
    permanentAsh: '#55555A',
    info: '#FFFFFF',
    error: '#EF5A5A',
    cardBackground: '#181613',
    loadStateColour: '#26231F',
    shimmerColour: '#36322C',
    success: '#5FB3A1',
    accent: '#CFAE74',
    onAccent: '#16120A',
    accentSoft: 'rgba(207, 174, 116, 0.14)',
    primaryAction: '#F3EFE7',
    onPrimaryAction: '#0F0E0C',
    raised: '#181613',
    shadow: 'rgba(0, 0, 0, 0.5)',
    scrim: 'rgba(0, 0, 0, 0.65)',
    scheme: ColorScheme.Dark,
  };

  /** Colours that do not follow the theme: over photos, and the card art. */
  static readonly fixed = {
    white: '#FFFFFF',
    black: '#000000',
    /** Behind a photo while it loads. */
    photoBackdrop: '#191919',
    /** Round buttons laid over a photo. */
    photoScrim: 'rgba(0, 0, 0, 0.45)',
    /** A thin edge on glass laid over a photo. */
    onPhotoHairline: 'rgba(255, 255, 255, 0.35)',
    /** Secondary text over a photo. */
    onPhotoMuted: 'rgba(255, 255, 255, 0.7)',
    /** The face of a payment card. */
    cardGold: '#C9B37E',
    cardStripe: '#0A0A0A',
    cardBack: '#E9E6DF',
    cardInk: '#111111',
  } as const;

  static of(scheme: ColorScheme): AppPalette {
    return scheme === ColorScheme.Dark ? AppColors.dark : AppColors.light;
  }
}
