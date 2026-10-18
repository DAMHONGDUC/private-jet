import { Text, type TextProps } from 'react-native';
import { blackJetFonts, makeStyles } from '@/core/theme/blackjet';
import { typeScale } from '@/core/theme/theme';

type Variant = 'display' | 'title' | 'subtitle' | 'body' | 'caption' | 'label';

type Props = TextProps & {
  variant?: Variant;
  muted?: boolean;
  /** The strongest colour: black on light, white on dark. */
  accent?: boolean;
};

/** App text in KnulTrial; the variant sets size and font file, from the four sizes in `typeScale`. */
export function AppText({
  variant = 'body',
  muted,
  accent,
  style,
  ...rest
}: Props) {
  const styles = useStyles();
  return (
    <Text
      {...rest}
      style={[
        styles.base,
        styles[variant],
        muted && styles.muted,
        accent && styles.accent,
        style,
      ]}
    />
  );
}

const useStyles = makeStyles(palette => ({
  base: {
    color: palette.primaryText,
    fontFamily: blackJetFonts.regular,
    includeFontPadding: false,
  },
  display: {
    fontSize: typeScale.display,
    lineHeight: 34,
    fontFamily: blackJetFonts.medium,
    letterSpacing: -0.4,
  },
  title: {
    fontSize: typeScale.title,
    lineHeight: 26,
    fontFamily: blackJetFonts.medium,
  },
  subtitle: {
    fontSize: typeScale.body,
    lineHeight: 21,
    fontFamily: blackJetFonts.medium,
  },
  body: { fontSize: typeScale.body, lineHeight: 22 },
  caption: { fontSize: typeScale.caption, lineHeight: 17 },
  label: {
    fontSize: typeScale.caption,
    lineHeight: 17,
    fontFamily: blackJetFonts.medium,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  muted: { color: palette.secondaryText },
  accent: { color: palette.jetBlack },
}));
