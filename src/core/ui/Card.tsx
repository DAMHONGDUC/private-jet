import { StyleSheet, View, type ViewProps } from 'react-native';
import { makeStyles } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { radius } from '@/core/theme/theme';

export function Card({ style, ...rest }: ViewProps) {
  const styles = useStyles();
  return <View {...rest} style={[styles.card, style]} />;
}

const useStyles = makeStyles(palette => ({
  /** A white surface with a hairline edge, rather than a grey block. */
  card: {
    backgroundColor: palette.cardBackground,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.iron,
    padding: AppSpacing.card,
  },
}));
