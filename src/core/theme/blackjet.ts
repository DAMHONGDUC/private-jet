import { useColorScheme } from 'react-native';

/**
 * The BlackJet look the dashboard is rebuilt in (feature-docs/dashboard §1).
 * The rest of the app keeps `theme.ts`; screens opt in with `useBlackJetTheme`.
 */
export type BlackJetPalette = {
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
  scheme: 'light' | 'dark';
};

export const blackJetLight: BlackJetPalette = {
  primaryText: '#000000',
  secondaryText: '#555553',
  primaryBackground: '#F7F7F7',
  secondaryBackground: '#FFFFFF',
  jetBlack: '#000000',
  ghostWhite: '#FFFFFF',
  iron: '#E3E3E3',
  ashGrey: '#B4B4B4',
  permanentAsh: '#555553',
  info: '#FFFFFF',
  error: '#EE4040',
  cardBackground: '#F1EFEF',
  loadStateColour: '#B4B4B4',
  shimmerColour: '#E0E0E0',
  scheme: 'light',
};

export const blackJetDark: BlackJetPalette = {
  primaryText: '#FFFFFF',
  secondaryText: '#979797',
  primaryBackground: '#191919',
  secondaryBackground: '#000000',
  jetBlack: '#FFFFFF',
  ghostWhite: '#000000',
  iron: '#2A2B29',
  ashGrey: '#555553',
  permanentAsh: '#555553',
  info: '#FFFFFF',
  error: '#EE4040',
  cardBackground: '#0F0F0F',
  loadStateColour: '#2A2B29',
  shimmerColour: '#545751',
  scheme: 'dark',
};

/** Colours that do not follow the theme. */
export const blackJetFixed = {
  navBackground: '#191919',
  navActive: '#FFFFFF',
  navInactive: '#555553',
  white: '#FFFFFF',
  black: '#000000',
} as const;

/** PostScript names, which are also the bundled file names, so both platforms resolve them. */
export const blackJetFonts = {
  regular: 'KnulTrial-Regular',
  medium: 'KnulTrial-Medium',
  bold: 'KnulTrial-Bold',
} as const;

/** Cubic-bezier control points of the curves the app animates with. */
export const blackJetCurves = {
  easeInOut: [0.42, 0, 0.58, 1],
  easeIn: [0.42, 0, 1, 1],
  ease: [0.25, 0.1, 0.25, 1],
} as const;

export function useBlackJetTheme(): BlackJetPalette {
  return useColorScheme() === 'dark' ? blackJetDark : blackJetLight;
}
