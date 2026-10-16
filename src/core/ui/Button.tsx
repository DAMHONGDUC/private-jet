import { ActivityIndicator, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/core/theme/theme';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  testID?: string;
};

export function Button({ title, onPress, loading, disabled, variant = 'primary', testID }: Props) {
  const inactive = disabled || loading;

  return (
    <PressableScale
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={[styles.base, variant === 'primary' ? styles.primary : styles.secondary, inactive && styles.inactive]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.background : colors.gold} />
      ) : (
        <AppText variant="subtitle" style={variant === 'primary' ? styles.primaryText : styles.secondaryText}>
          {title}
        </AppText>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  primary: { backgroundColor: colors.gold },
  secondary: { borderWidth: 1, borderColor: colors.gold },
  inactive: { opacity: 0.5 },
  primaryText: { color: colors.background },
  secondaryText: { color: colors.gold },
});
