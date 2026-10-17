import { Text, type TextProps } from 'react-native';
import { blackJetFonts, makeStyles } from '@/core/theme/blackjet';

type Variant = 'display' | 'title' | 'subtitle' | 'body' | 'caption' | 'label';

type Props = TextProps & {
  variant?: Variant;
  muted?: boolean;
  /** The strongest colour: black on light, white on dark. */
  accent?: boolean;
};

/** App text in KnulTrial; the variant sets size and font file. */
export function AppText({ variant = 'body', muted, accent, style, ...rest }: Props) {
  const styles = useStyles();
  return (
    <Text
      {...rest}
      style={[styles.base, styles[variant], muted && styles.muted, accent && styles.accent, style]}
    />
  );
}

const useStyles = makeStyles(palette => ({
  base: { color: palette.primaryText, fontFamily: blackJetFonts.regular, includeFontPadding: false },
  display: { fontSize: 30, fontFamily: blackJetFonts.bold, letterSpacing: -0.5 },
  title: { fontSize: 20, fontFamily: blackJetFonts.bold },
  subtitle: { fontSize: 16, fontFamily: blackJetFonts.medium },
  body: { fontSize: 15 },
  caption: { fontSize: 13 },
  label: { fontSize: 12, fontFamily: blackJetFonts.medium, letterSpacing: 1, textTransform: 'uppercase' },
  muted: { color: palette.secondaryText },
  accent: { color: palette.jetBlack },
}));
