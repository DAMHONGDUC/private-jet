import { StyleSheet, useColorScheme, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';

/**
 * The BlackJet look (feature-docs/dashboard §1), light and dark, following the
 * system setting. Spacing and radii stay in `theme.ts`.
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
  success: string;
  /** Translucent backdrop behind sheets and dialogs. */
  scrim: string;
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
  success: '#249689',
  scrim: 'rgba(0, 0, 0, 0.45)',
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
  success: '#2FB3A3',
  scrim: 'rgba(0, 0, 0, 0.65)',
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

/**
 * Styles that depend on the palette, built once per scheme:
 * `const useStyles = makeStyles(p => ({ card: { backgroundColor: p.primaryBackground } }))`.
 */
type NamedStyles = Record<string, ViewStyle | TextStyle | ImageStyle>;

export function makeStyles<T extends NamedStyles>(factory: (palette: BlackJetPalette) => T): () => Readonly<T> {
  const light = StyleSheet.create(factory(blackJetLight));
  const dark = StyleSheet.create(factory(blackJetDark));
  return function useStyles() {
    return useBlackJetTheme().scheme === 'dark' ? dark : light;
  };
}
