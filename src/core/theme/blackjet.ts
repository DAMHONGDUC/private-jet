import {
  StyleSheet,
  useColorScheme,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

/**
 * The BlackJet look, light and dark: warm neutrals, near-black text and one champagne accent (60/30/10), following the
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
  /** The one brand colour, about a tenth of any screen: the main button, selection, key icons. */
  accent: string;
  /** Text and icons on `accent`. */
  onAccent: string;
  /** `accent` washed out: selected rows, secondary highlights. */
  accentSoft: string;
  /** Surfaces that float over the screen: the search card, pills, the selected segment. */
  raised: string;
  /** Soft shadow tinted to the background. */
  shadow: string;
  /** Translucent backdrop behind sheets and dialogs. */
  scrim: string;
  scheme: 'light' | 'dark';
};

export const blackJetLight: BlackJetPalette = {
  primaryText: '#111113',
  secondaryText: '#6B6B70',
  primaryBackground: '#F4F3F0',
  secondaryBackground: '#FFFFFF',
  jetBlack: '#111113',
  ghostWhite: '#FFFFFF',
  iron: '#E7E5E0',
  ashGrey: '#B4B3AE',
  permanentAsh: '#55555A',
  info: '#FFFFFF',
  error: '#D93A3A',
  cardBackground: '#F4F3F0',
  loadStateColour: '#B4B3AE',
  shimmerColour: '#E7E5E0',
  success: '#1F8A7E',
  accent: '#C8A15A',
  onAccent: '#16120A',
  accentSoft: 'rgba(200, 161, 90, 0.14)',
  raised: '#FFFFFF',
  shadow: 'rgba(60, 48, 24, 0.14)',
  scrim: 'rgba(17, 17, 19, 0.45)',
  scheme: 'light',
};

export const blackJetDark: BlackJetPalette = {
  primaryText: '#F5F5F3',
  secondaryText: '#9A9AA0',
  primaryBackground: '#202024',
  secondaryBackground: '#0B0B0C',
  jetBlack: '#F5F5F3',
  ghostWhite: '#0B0B0C',
  iron: '#2E2E33',
  ashGrey: '#55555A',
  permanentAsh: '#55555A',
  info: '#FFFFFF',
  error: '#EF5A5A',
  cardBackground: '#131315',
  loadStateColour: '#26262A',
  shimmerColour: '#3A3A3F',
  success: '#2FB3A3',
  accent: '#D4AE6A',
  onAccent: '#16120A',
  accentSoft: 'rgba(212, 174, 106, 0.16)',
  raised: '#18181B',
  shadow: 'rgba(0, 0, 0, 0.5)',
  scrim: 'rgba(0, 0, 0, 0.65)',
  scheme: 'dark',
};

/** Colours that do not follow the theme. */
export const blackJetFixed = {
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

export function makeStyles<T extends NamedStyles>(
  factory: (palette: BlackJetPalette) => T,
): () => Readonly<T> {
  const light = StyleSheet.create(factory(blackJetLight));
  const dark = StyleSheet.create(factory(blackJetDark));
  return function useStyles() {
    return useBlackJetTheme().scheme === 'dark' ? dark : light;
  };
}
