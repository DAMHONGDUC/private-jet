import { StyleSheet, Text, type TextProps } from 'react-native';
import { colors } from '@/core/theme/theme';

type Variant = 'display' | 'title' | 'subtitle' | 'body' | 'caption' | 'label';

type Props = TextProps & { variant?: Variant; muted?: boolean; gold?: boolean };

export function AppText({ variant = 'body', muted, gold, style, ...rest }: Props) {
  return (
    <Text
      {...rest}
      style={[styles.base, styles[variant], muted && styles.muted, gold && styles.gold, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: { color: colors.text },
  display: { fontSize: 30, fontWeight: '700', letterSpacing: -0.5 },
  title: { fontSize: 20, fontWeight: '700' },
  subtitle: { fontSize: 16, fontWeight: '600' },
  body: { fontSize: 15 },
  caption: { fontSize: 13 },
  label: { fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  muted: { color: colors.textMuted },
  gold: { color: colors.gold },
});
