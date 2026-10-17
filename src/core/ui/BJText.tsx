import { StyleSheet, Text, type TextProps } from 'react-native';
import { blackJetFonts, useBlackJetTheme, type BlackJetPalette } from '@/core/theme/blackjet';

type Weight = 'regular' | 'medium' | 'bold';
type Tone = 'primary' | 'secondary' | 'inverse' | 'white';

type Props = TextProps & {
  size?: number;
  weight?: Weight;
  tone?: Tone;
};

const toneColor = (palette: BlackJetPalette, tone: Tone) =>
  ({
    primary: palette.primaryText,
    secondary: palette.secondaryText,
    inverse: palette.ghostWhite,
    white: '#FFFFFF',
  })[tone];

/** Text in KnulTrial; the weight picks the font file, never `fontWeight`. */
export function BJText({ size = 14, weight = 'medium', tone = 'primary', style, ...rest }: Props) {
  const palette = useBlackJetTheme();
  return (
    <Text
      {...rest}
      style={[
        styles.base,
        { fontSize: size, fontFamily: blackJetFonts[weight], color: toneColor(palette, tone) },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: { includeFontPadding: false },
});
