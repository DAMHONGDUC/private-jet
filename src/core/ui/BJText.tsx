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
  | 'onAccent';

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
    white: '#FFFFFF',
    accent: palette.accent,
    onAccent: palette.onAccent,
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
          fontFamily: blackJetFonts[weight],
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
