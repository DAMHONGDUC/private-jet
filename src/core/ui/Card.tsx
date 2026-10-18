import { View, type ViewProps } from 'react-native';
import { makeStyles } from '@/core/theme/blackjet';
import { radius, spacing } from '@/core/theme/theme';

export function Card({ style, ...rest }: ViewProps) {
  const styles = useStyles();
  return <View {...rest} style={[styles.card, style]} />;
}

const useStyles = makeStyles(palette => ({
  card: {
    backgroundColor: palette.primaryBackground,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
}));
