import { StyleSheet, Text, View } from 'react-native';
import { APP_NAME } from '@/core/app-identity';
import { AppColors } from '@/core/theme/app-colors';
import { blackJetFonts, useBlackJetTheme } from '@/core/theme/blackjet';

export enum WordmarkTone {
  Theme = 'theme',
  OnPhoto = 'onPhoto',
}

type Props = {
  /** `onPhoto` for white type over a photo; otherwise it follows the theme. */
  tone?: WordmarkTone;
  testID?: string;
};

/**
 * The brand set in type: SOVEREIGN in the serif, widely tracked, over a
 * small PRIVATE JET in gold. Stands in for a drawn logo until one exists.
 */
export function Wordmark({ tone = WordmarkTone.Theme, testID }: Props) {
  const palette = useBlackJetTheme();
  const ink =
    tone === WordmarkTone.OnPhoto ? AppColors.fixed.white : palette.primaryText;
  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="header"
      accessibilityLabel={APP_NAME}
      style={styles.root}
    >
      <Text style={[styles.name, { color: ink }]}>
        {APP_NAME.toUpperCase()}
      </Text>
      <Text style={[styles.tagline, { color: palette.accent }]}>
        PRIVATE JET
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'flex-start', gap: 2 },
  name: {
    fontFamily: blackJetFonts.display,
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: 5,
    includeFontPadding: false,
  },
  tagline: {
    fontFamily: blackJetFonts.medium,
    fontSize: 9,
    lineHeight: 11,
    letterSpacing: 3.2,
    includeFontPadding: false,
  },
});
