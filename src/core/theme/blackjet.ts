import {
  Platform,
  StyleSheet,
  useColorScheme,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSelector } from 'react-redux';
import {
  ThemeMode,
  selectThemeMode,
} from '@/core/preferences/preferences-slice';
import { AppColors, ColorScheme, type AppPalette } from './app-colors';

/** The palette type, owned by `AppColors`. */
export type BlackJetPalette = AppPalette;

/**
 * PostScript names, which are also the bundled file names, so both platforms
 * resolve them. `display` is the system serif for headlines, prices and
 * references: Baskerville on iOS, Noto Serif on Android. Both ship with the
 * OS, so they need no licence.
 */
export const blackJetFonts = {
  regular: 'KnulTrial-Regular',
  medium: 'KnulTrial-Medium',
  bold: 'KnulTrial-Bold',
  display: Platform.select({ ios: 'Baskerville', default: 'serif' }),
} as const;

/** Cubic-bezier control points of the curves the app animates with. */
export const blackJetCurves = {
  easeInOut: [0.42, 0, 0.58, 1],
  easeIn: [0.42, 0, 1, 1],
  ease: [0.25, 0.1, 0.25, 1],
} as const;

/** The scheme on screen: the member's choice, or the phone's when they left it on system. */
export function useColorSchemePreference(): ColorScheme {
  const system = useColorScheme();
  const mode = useSelector(selectThemeMode);
  switch (mode) {
    case ThemeMode.Light:
      return ColorScheme.Light;
    case ThemeMode.Dark:
      return ColorScheme.Dark;
    case ThemeMode.System:
      return system === ColorScheme.Dark ? ColorScheme.Dark : ColorScheme.Light;
  }
}

/** The palette for the scheme on screen. */
export function useBlackJetTheme(): BlackJetPalette {
  return AppColors.of(useColorSchemePreference());
}

/**
 * Styles that depend on the palette, built once per scheme:
 * `const useStyles = makeStyles(p => ({ card: { backgroundColor: p.primaryBackground } }))`.
 */
type NamedStyles = Record<string, ViewStyle | TextStyle | ImageStyle>;

export function makeStyles<T extends NamedStyles>(
  factory: (palette: BlackJetPalette) => T,
): () => Readonly<T> {
  const light = StyleSheet.create(factory(AppColors.light));
  const dark = StyleSheet.create(factory(AppColors.dark));
  return function useStyles() {
    return useBlackJetTheme().scheme === ColorScheme.Dark ? dark : light;
  };
}
