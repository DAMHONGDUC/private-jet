import { AppColors } from '@/core/theme/app-colors';
import { StyleSheet, Text, type TextProps } from 'react-native';
import {
  blackJetFonts,
  useBlackJetTheme,
  type BlackJetPalette,
} from '@/core/theme/blackjet';
import { typeScale, type TypeSize } from '@/core/theme/theme';

type Weight = 'regular' | 'medium';
type Tone =
  | 'primary'
  | 'secondary'
  | 'inverse'
  | 'white'
  | 'accent'
  | 'onAccent'
  | 'onPrimary';

type Props = TextProps & {
  /** One of the four sizes in `typeScale`. */
  size?: TypeSize;
  weight?: Weight;
  tone?: Tone;
};

const toneColor = (palette: BlackJetPalette, tone: Tone) =>
  ({
    primary: palette.primaryText,
    secondary: palette.secondaryText,
    inverse: palette.ghostWhite,
    white: AppColors.fixed.white,
    accent: palette.accent,
    onAccent: palette.onAccent,
    onPrimary: palette.onPrimaryAction,
  }[tone]);

/** Text in KnulTrial; the weight picks the font file, never `fontWeight`. */
export function BJText({
  size = typeScale.body,
  weight = 'medium',
  tone = 'primary',
  style,
  ...rest
}: Props) {
  const palette = useBlackJetTheme();
  return (
    <Text
      {...rest}
      style={[
        styles.base,
        {
          fontSize: size,
          lineHeight: Math.round(size * 1.3),
          // Headline sizes take the serif; the weight only picks the sans file.
          fontFamily:
            size >= typeScale.title
              ? blackJetFonts.display
              : blackJetFonts[weight],
          color: toneColor(palette, tone),
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: { includeFontPadding: false },
});
